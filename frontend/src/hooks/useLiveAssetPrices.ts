/**
 * useLiveAssetPrices
 * Polls the backend for live stock quotes at the requested interval.
 * Only symbols that look like exchange tickers (1-5 uppercase letters) are
 * fetched; others are left as "unavailable" immediately.
 *
 * Returns a map of symbol → PriceEntry containing the latest data,
 * loading / error / stale state, and the last-updated timestamp.
 */

import { useState, useEffect } from 'react';
import { StocksService } from '../services/stocksService';
import type { StockQuote } from '../services/stocksService';

export interface PriceEntry {
  quote: StockQuote | null;
  loading: boolean;
  /** Error message from the most recent failed fetch (null if last fetch succeeded) */
  error: string | null;
  /** True when the last refresh failed but we still have an older quote to show */
  stale: boolean;
  lastUpdated: Date | null;
  /** Symbol was filtered out on the client before any network request */
  unavailable: boolean;
}

export type PricesMap = Record<string, PriceEntry>;

/** Regex for US-style equity tickers: 1–5 uppercase letters (e.g. AAPL, MSFT) */
const STOCK_TICKER_RE = /^[A-Z]{1,5}$/;

export function isLikelyStockTicker(symbol: string): boolean {
  return STOCK_TICKER_RE.test(symbol);
}

/**
 * @param symbols    List of asset symbols derived from the user's portfolio.
 * @param intervalMs Polling interval in milliseconds.
 */
export function useLiveAssetPrices(symbols: string[], intervalMs: number): PricesMap {
  const [prices, setPrices] = useState<PricesMap>(() => buildInitialState(symbols));

  // Derive which symbols are trackable and create a stable key for the effect
  const trackable = symbols.filter(isLikelyStockTicker);
  const trackableKey = [...trackable].sort().join(',');

  useEffect(() => {
    // Rebuild state whenever the set of tracked symbols changes
    setPrices(buildInitialState(symbols));

    if (trackable.length === 0) return;

    let cancelled = false;

    const fetchPrices = async () => {
      if (cancelled) return;

      // Mark tracked symbols as loading while preserving existing quotes
      setPrices((prev) => {
        const next = { ...prev };
        trackable.forEach((sym) => {
          next[sym] = { ...next[sym], loading: true };
        });
        return next;
      });

      try {
        const results = await StocksService.getQuotes(trackable);
        if (cancelled) return;
        const now = new Date();

        setPrices((prev) => {
          const next = { ...prev };
          trackable.forEach((sym) => {
            const result = results[sym];
            if (!result) return;

            if ('error' in result) {
              next[sym] = {
                quote: prev[sym]?.quote ?? null,
                loading: false,
                error: result.error,
                stale: prev[sym]?.quote != null,
                lastUpdated: prev[sym]?.lastUpdated ?? null,
                unavailable: false,
              };
            } else {
              next[sym] = {
                quote: result,
                loading: false,
                error: null,
                stale: false,
                lastUpdated: now,
                unavailable: false,
              };
            }
          });
          return next;
        });
      } catch (err: unknown) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Failed to fetch live prices';

        setPrices((prev) => {
          const next = { ...prev };
          trackable.forEach((sym) => {
            next[sym] = {
              quote: prev[sym]?.quote ?? null,
              loading: false,
              error: message,
              stale: prev[sym]?.quote != null,
              lastUpdated: prev[sym]?.lastUpdated ?? null,
              unavailable: false,
            };
          });
          return next;
        });
      }
    };

    fetchPrices();
    const id = setInterval(fetchPrices, intervalMs);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [trackableKey, intervalMs]); // eslint-disable-line react-hooks/exhaustive-deps
  // trackable is derived from trackableKey, so including it would be redundant.
  // symbols is captured once at effect setup via the stable trackableKey dep.

  return prices;
}

function buildInitialState(symbols: string[]): PricesMap {
  return Object.fromEntries(
    symbols.map((sym) => [
      sym,
      {
        quote: null,
        loading: isLikelyStockTicker(sym),
        error: null,
        stale: false,
        lastUpdated: null,
        unavailable: !isLikelyStockTicker(sym),
      } satisfies PriceEntry,
    ])
  );
}
