-- Insert Script: 006_insert_user_transactions.sql
-- Description: Insert sample transaction data for a specific user
-- User ID: 6eee4d7d-3f49-4539-9744-18327390bff2
-- Created: 2026-03-03

DO $$
DECLARE
    target_user_id uuid := '6eee4d7d-3f49-4539-9744-18327390bff2';
BEGIN
    RAISE NOTICE 'Inserting transactions for user: %', target_user_id;

    -- ─── AAPL — Apple Inc. ──────────────────────────────────────────────────
    INSERT INTO public.transactions (
        id, user_id, symbol, name, type,
        quantity, price_per_unit, total_amount,
        currency, transaction_date, fees, notes,
        created_at, updated_at
    ) VALUES
    (
        gen_random_uuid(), target_user_id,
        'AAPL', 'Apple Inc.', 'buy',
        10, 150.00, 1500.00,
        'CAD', '2025-01-15T10:30:00Z', 9.99, 'Initial AAPL position',
        NOW(), NOW()
    ),
    (
        gen_random_uuid(), target_user_id,
        'AAPL', 'Apple Inc.', 'buy',
        5, 145.00, 725.00,
        'CAD', '2025-02-10T14:15:00Z', 9.99, 'DCA — AAPL dip',
        NOW(), NOW()
    ),
    (
        gen_random_uuid(), target_user_id,
        'AAPL', 'Apple Inc.', 'sell',
        3, 185.00, 555.00,
        'CAD', '2025-06-20T11:45:00Z', 9.99, 'Taking partial profits',
        NOW(), NOW()
    );

    -- ─── TSLA — Tesla Inc. ──────────────────────────────────────────────────
    INSERT INTO public.transactions (
        id, user_id, symbol, name, type,
        quantity, price_per_unit, total_amount,
        currency, transaction_date, fees, notes,
        created_at, updated_at
    ) VALUES
    (
        gen_random_uuid(), target_user_id,
        'TSLA', 'Tesla Inc.', 'buy',
        5, 200.00, 1000.00,
        'CAD', '2025-01-25T13:20:00Z', 9.99, NULL,
        NOW(), NOW()
    ),
    (
        gen_random_uuid(), target_user_id,
        'TSLA', 'Tesla Inc.', 'buy',
        3, 175.00, 525.00,
        'CAD', '2025-03-12T09:45:00Z', 9.99, 'Adding to TSLA on dip',
        NOW(), NOW()
    ),
    (
        gen_random_uuid(), target_user_id,
        'TSLA', 'Tesla Inc.', 'sell',
        2, 250.00, 500.00,
        'CAD', '2025-08-05T15:30:00Z', 9.99, 'Trimming TSLA gains',
        NOW(), NOW()
    );

    -- ─── MSFT — Microsoft Corporation ────────────────────────────────────────
    INSERT INTO public.transactions (
        id, user_id, symbol, name, type,
        quantity, price_per_unit, total_amount,
        currency, transaction_date, fees, notes,
        created_at, updated_at
    ) VALUES
    (
        gen_random_uuid(), target_user_id,
        'MSFT', 'Microsoft Corporation', 'buy',
        8, 310.00, 2480.00,
        'CAD', '2025-02-05T10:15:00Z', 9.99, 'Tech diversification',
        NOW(), NOW()
    ),
    (
        gen_random_uuid(), target_user_id,
        'MSFT', 'Microsoft Corporation', 'buy',
        4, 280.00, 1120.00,
        'CAD', '2025-04-18T11:00:00Z', 9.99, 'MSFT on earnings dip',
        NOW(), NOW()
    );

    -- ─── BTC — Bitcoin ──────────────────────────────────────────────────────
    INSERT INTO public.transactions (
        id, user_id, symbol, name, type,
        quantity, price_per_unit, total_amount,
        currency, transaction_date, fees, notes,
        created_at, updated_at
    ) VALUES
    (
        gen_random_uuid(), target_user_id,
        'BTC', 'Bitcoin', 'buy',
        0.1, 55000.00, 5500.00,
        'CAD', '2025-01-20T09:00:00Z', 25.00, 'Initial crypto position',
        NOW(), NOW()
    ),
    (
        gen_random_uuid(), target_user_id,
        'BTC', 'Bitcoin', 'buy',
        0.05, 48000.00, 2400.00,
        'CAD', '2025-05-10T16:00:00Z', 20.00, 'BTC dip buy',
        NOW(), NOW()
    );

    -- ─── NVDA — NVIDIA Corporation ───────────────────────────────────────────
    INSERT INTO public.transactions (
        id, user_id, symbol, name, type,
        quantity, price_per_unit, total_amount,
        currency, transaction_date, fees, notes,
        created_at, updated_at
    ) VALUES
    (
        gen_random_uuid(), target_user_id,
        'NVDA', 'NVIDIA Corporation', 'buy',
        6, 420.00, 2520.00,
        'CAD', '2025-03-01T10:00:00Z', 9.99, 'AI play — NVDA',
        NOW(), NOW()
    ),
    (
        gen_random_uuid(), target_user_id,
        'NVDA', 'NVIDIA Corporation', 'buy',
        4, 380.00, 1520.00,
        'CAD', '2025-07-14T13:45:00Z', 9.99, 'Adding to NVDA position',
        NOW(), NOW()
    );

    RAISE NOTICE 'Done! Inserted 12 transactions across AAPL, TSLA, MSFT, BTC, NVDA.';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error: %', SQLERRM;
        RAISE NOTICE 'Make sure the transactions table exists and the user ID is valid in auth.users.';
END $$;
