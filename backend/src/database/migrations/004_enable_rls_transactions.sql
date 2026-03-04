-- Migration: 004_enable_rls_transactions.sql
-- Description: Enable Row Level Security (RLS) for transactions table
-- Created: 2026-03-01

-- Enable RLS on transactions table
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only access their own transactions
CREATE POLICY "Users can only access their own transactions" ON public.transactions
    FOR ALL USING (auth.uid() = user_id);

-- Create policy for authenticated users to insert transactions
CREATE POLICY "Authenticated users can insert transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own transactions
CREATE POLICY "Users can update their own transactions" ON public.transactions
    FOR UPDATE USING (auth.uid() = user_id);

-- Create policy for users to delete their own transactions
CREATE POLICY "Users can delete their own transactions" ON public.transactions
    FOR DELETE USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON public.transactions TO authenticated;
GRANT USAGE ON SEQUENCE transactions_id_seq TO authenticated;
