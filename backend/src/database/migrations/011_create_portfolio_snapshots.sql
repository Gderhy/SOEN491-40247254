-- Migration: Create portfolio_snapshots table
-- Stores periodic snapshots of total portfolio value per user

CREATE TABLE IF NOT EXISTS portfolio_snapshots (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date       DATE NOT NULL,
  portfolio_value NUMERIC(18,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);

-- Enable Row Level Security
ALTER TABLE portfolio_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS: users can only access their own snapshots
CREATE POLICY "Users can read own snapshots"
  ON portfolio_snapshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own snapshots"
  ON portfolio_snapshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own snapshots"
  ON portfolio_snapshots FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own snapshots"
  ON portfolio_snapshots FOR DELETE
  USING (auth.uid() = user_id);

-- Index for fast queries by user + date
CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_user_date
  ON portfolio_snapshots (user_id, date DESC);
