-- Migration: 010_add_account_id_to_transactions.sql
-- Description: Link transactions to trading accounts; add supporting indexes.
-- Created: 2026-03-03
--
-- NOTE: account_id is added as nullable first so that the column can be added
--       even if existing rows exist (they will default to NULL).
--       If you want to back-fill existing rows before enforcing NOT NULL,
--       do so before running the ALTER … SET NOT NULL statement below.
--       For a fresh/dev database with no existing transaction rows the two
--       statements can be executed together without issue.

-- 1. Add the column (nullable to support existing rows)
ALTER TABLE public.transactions
    ADD COLUMN IF NOT EXISTS account_id uuid
        REFERENCES public.trading_accounts(id) ON DELETE RESTRICT;

-- 2. Add indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_transactions_account_id
    ON public.transactions(account_id);

CREATE INDEX IF NOT EXISTS idx_transactions_user_account_date
    ON public.transactions(user_id, account_id, transaction_date DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_account_symbol
    ON public.transactions(account_id, symbol);

COMMENT ON COLUMN public.transactions.account_id IS 'The trading account this transaction was executed in';
