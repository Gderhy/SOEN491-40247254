-- Migration: 007_portfolio_holdings_function.sql
-- Description: DB-side aggregation function for portfolio holdings.
--   Returns one row per symbol for a given user, computing:
--     • net quantity (buys - sells)
--     • weighted-average cost basis (buys only)
--     • total amount invested (buys only)
--     • realized P&L from sell transactions (sell proceeds - avg-cost basis at time of sell)
--     • total fees
--     • first / last transaction dates
--     • transaction count
--
--   NOTE: Realized P&L is approximated as:
--         SUM(sell_quantity * sell_price)  -  SUM(sell_quantity) * avg_buy_price
--   This is the standard average-cost method.
--
-- Created: 2026-03-03

CREATE OR REPLACE FUNCTION public.get_portfolio_holdings(p_user_id uuid)
RETURNS TABLE (
  symbol               text,
  name                 text,
  total_quantity       numeric,
  average_buy_price    numeric,
  total_invested       numeric,
  realized_pnl         numeric,
  total_fees           numeric,
  transaction_count    bigint,
  first_purchase_date  timestamptz,
  last_transaction_date timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  WITH
  -- ── 1. per-symbol buy aggregates (cost basis) ──────────────────
  buys AS (
    SELECT
      symbol,
      -- last non-null name associated with this symbol
      (ARRAY_AGG(name ORDER BY transaction_date DESC))[1]   AS name,
      SUM(quantity)                                          AS buy_qty,
      SUM(total_amount)                                      AS buy_total,
      -- weighted average buy price
      CASE
        WHEN SUM(quantity) > 0
        THEN SUM(total_amount) / SUM(quantity)
        ELSE 0
      END                                                    AS avg_buy_price
    FROM public.transactions
    WHERE user_id = p_user_id
      AND type = 'buy'
    GROUP BY symbol
  ),

  -- ── 2. per-symbol sell aggregates ──────────────────────────────
  sells AS (
    SELECT
      symbol,
      SUM(quantity)     AS sell_qty,
      SUM(total_amount) AS sell_proceeds
    FROM public.transactions
    WHERE user_id = p_user_id
      AND type = 'sell'
    GROUP BY symbol
  ),

  -- ── 3. per-symbol totals (fees, dates, count) ──────────────────
  totals AS (
    SELECT
      symbol,
      SUM(fees)                         AS total_fees,
      COUNT(*)                          AS transaction_count,
      MIN(transaction_date)             AS first_purchase_date,
      MAX(transaction_date)             AS last_transaction_date
    FROM public.transactions
    WHERE user_id = p_user_id
    GROUP BY symbol
  )

  SELECT
    b.symbol,
    b.name,
    -- net quantity = bought - sold (always >= 0 after we filter)
    (b.buy_qty - COALESCE(s.sell_qty, 0))                                    AS total_quantity,
    ROUND(b.avg_buy_price, 8)                                                AS average_buy_price,
    -- total invested = cost of shares still held
    ROUND((b.buy_qty - COALESCE(s.sell_qty, 0)) * b.avg_buy_price, 2)       AS total_invested,
    -- realized P&L = sell proceeds minus the avg-cost basis of those shares
    ROUND(COALESCE(s.sell_proceeds, 0) - COALESCE(s.sell_qty, 0) * b.avg_buy_price, 2) AS realized_pnl,
    ROUND(COALESCE(t.total_fees, 0), 2)                                      AS total_fees,
    t.transaction_count,
    t.first_purchase_date,
    t.last_transaction_date
  FROM buys b
  LEFT JOIN sells  s USING (symbol)
  LEFT JOIN totals t USING (symbol)
  -- only return symbols where the user still holds shares
  WHERE (b.buy_qty - COALESCE(s.sell_qty, 0)) > 0
  ORDER BY total_invested DESC;
$$;

-- Grant execute to the authenticated role so the anon/jwt client can call it
GRANT EXECUTE ON FUNCTION public.get_portfolio_holdings(uuid) TO authenticated;
