-- Migration: 008_create_trading_platforms.sql
-- Description: Create the trading_platforms table
-- Created: 2026-03-03

CREATE TABLE IF NOT EXISTS public.trading_platforms (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name        text NOT NULL,
    created_at  timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT uq_platform_user_name UNIQUE (user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_trading_platforms_user_id ON public.trading_platforms(user_id);

COMMENT ON TABLE  public.trading_platforms IS 'Brokerage / trading platforms (e.g. Questrade, Wealthsimple)';
COMMENT ON COLUMN public.trading_platforms.name IS 'Platform display name, unique per user';

-- Enable Row Level Security
ALTER TABLE public.trading_platforms ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users may only see / modify their own platforms
CREATE POLICY "Users can view own platforms"
    ON public.trading_platforms FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own platforms"
    ON public.trading_platforms FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own platforms"
    ON public.trading_platforms FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own platforms"
    ON public.trading_platforms FOR DELETE
    USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.trading_platforms TO authenticated;
