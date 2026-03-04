-- Migration: 003_create_transactions_table.sql
-- Description: Create the transactions table for tracking buy/sell transactions
-- Created: 2026-03-01

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    
    user_id uuid NOT NULL
        REFERENCES auth.users(id)
        ON DELETE CASCADE,
    
    symbol text NOT NULL,
    name text NOT NULL,
    type text NOT NULL CHECK (type IN ('buy', 'sell')),
    
    quantity numeric(20,8) NOT NULL CHECK (quantity > 0),
    price_per_unit numeric(20,2) NOT NULL CHECK (price_per_unit > 0),
    total_amount numeric(20,2) NOT NULL CHECK (total_amount > 0),
    
    currency text NOT NULL DEFAULT 'CAD',
    transaction_date timestamptz NOT NULL DEFAULT now(),
    fees numeric(20,2) DEFAULT 0 CHECK (fees >= 0),
    
    notes text,
    
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_symbol ON public.transactions(symbol);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_symbol ON public.transactions(user_id, symbol);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating updated_at column
DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;
CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add comment to table
COMMENT ON TABLE public.transactions IS 'Stores user investment transactions (buy/sell orders)';
COMMENT ON COLUMN public.transactions.symbol IS 'Stock/crypto symbol (e.g., AAPL, BTC)';
COMMENT ON COLUMN public.transactions.type IS 'Transaction type: buy or sell';
COMMENT ON COLUMN public.transactions.quantity IS 'Number of shares/units purchased/sold';
COMMENT ON COLUMN public.transactions.price_per_unit IS 'Price per share/unit at time of transaction';
COMMENT ON COLUMN public.transactions.total_amount IS 'Total transaction amount (quantity * price_per_unit)';
COMMENT ON COLUMN public.transactions.fees IS 'Transaction fees/commissions';
