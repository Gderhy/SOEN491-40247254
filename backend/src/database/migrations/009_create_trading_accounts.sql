-- Migration: 009_create_trading_accounts.sql
-- Description: Create the trading_accounts table linked to platforms
-- Created: 2026-03-03

CREATE TABLE IF NOT EXISTS public.trading_accounts (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    platform_id    uuid NOT NULL REFERENCES public.trading_platforms(id) ON DELETE CASCADE,
    account_name   text NOT NULL,
    account_number text,
    currency       text NOT NULL DEFAULT 'CAD',
    created_at     timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT uq_account_user_platform_name UNIQUE (user_id, platform_id, account_name)
);

CREATE INDEX IF NOT EXISTS idx_trading_accounts_user_id     ON public.trading_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_accounts_platform_id ON public.trading_accounts(platform_id);

COMMENT ON TABLE  public.trading_accounts IS 'Individual brokerage accounts within a platform (e.g. TFSA, RRSP)';
COMMENT ON COLUMN public.trading_accounts.account_name   IS 'Account type label (e.g. TFSA, RRSP, Margin)';
COMMENT ON COLUMN public.trading_accounts.account_number IS 'Optional broker-assigned account number';

-- Enable Row Level Security
ALTER TABLE public.trading_accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own accounts"
    ON public.trading_accounts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own accounts"
    ON public.trading_accounts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts"
    ON public.trading_accounts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own accounts"
    ON public.trading_accounts FOR DELETE
    USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.trading_accounts TO authenticated;
