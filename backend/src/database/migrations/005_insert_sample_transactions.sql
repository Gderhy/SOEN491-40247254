-- Insert Script: 005_insert_sample_transactions.sql
-- Description: Insert sample transaction data for testing and demo purposes
-- Created: 2026-03-01
-- Note: This script automatically finds the first user in auth.users table
--       and inserts sample transactions for that user

-- Sample transactions for demo user
-- This script will find an actual user from auth.users table and insert sample data
DO $$
DECLARE
    demo_user_id uuid;
    user_count integer;
BEGIN
    -- Query to find an actual user from auth.users table
    SELECT COUNT(*) INTO user_count FROM auth.users LIMIT 1;
    
    IF user_count = 0 THEN
        RAISE NOTICE 'No users found in auth.users table. Please create a user first.';
        RAISE NOTICE 'You can create a user through Supabase Auth or your application signup.';
        RETURN;
    END IF;
    
    -- Get the first available user ID from auth.users
    SELECT id INTO demo_user_id 
    FROM auth.users 
    ORDER BY created_at ASC 
    LIMIT 1;
    
    RAISE NOTICE 'Using user ID: % for sample transactions', demo_user_id;
    
    -- Insert sample Apple (AAPL) transactions
    INSERT INTO public.transactions (
        id,
        user_id,
        symbol,
        name,
        type,
        quantity,
        price_per_unit,
        total_amount,
        currency,
        transaction_date,
        fees,
        created_at,
        updated_at
    ) VALUES 
    -- Initial Apple purchase
    (
        gen_random_uuid(),
        demo_user_id,
        'AAPL',
        'Apple Inc.',
        'buy',
        10,
        150.00,
        1500.00,
        'CAD',
        '2024-01-15T10:30:00Z',
        9.99,
        '2024-01-15T10:30:00Z',
        '2024-01-15T10:30:00Z'
    ),
    -- Second Apple purchase (dollar cost averaging)
    (
        gen_random_uuid(),
        demo_user_id,
        'AAPL',
        'Apple Inc.',
        'buy',
        5,
        145.00,
        725.00,
        'CAD',
        '2024-02-10T14:15:00Z',
        9.99,
        '2024-02-10T14:15:00Z',
        '2024-02-10T14:15:00Z'
    ),
    -- Partial Apple sale (taking profits)
    (
        gen_random_uuid(),
        demo_user_id,
        'AAPL',
        'Apple Inc.',
        'sell',
        3,
        160.00,
        480.00,
        'CAD',
        '2024-02-25T11:45:00Z',
        9.99,
        '2024-02-25T11:45:00Z',
        '2024-02-25T11:45:00Z'
    );
    
    -- Insert Bitcoin transaction
    INSERT INTO public.transactions (
        id,
        user_id,
        symbol,
        name,
        type,
        quantity,
        price_per_unit,
        total_amount,
        currency,
        transaction_date,
        fees,
        notes,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        demo_user_id,
        'BTC',
        'Bitcoin',
        'buy',
        0.1,
        50000.00,
        5000.00,
        'CAD',
        '2024-01-20T09:00:00Z',
        25.00,
        'Initial crypto investment',
        '2024-01-20T09:00:00Z',
        '2024-01-20T09:00:00Z'
    );
    
    -- Insert Tesla transactions
    INSERT INTO public.transactions (
        id,
        user_id,
        symbol,
        name,
        type,
        quantity,
        price_per_unit,
        total_amount,
        currency,
        transaction_date,
        fees,
        created_at,
        updated_at
    ) VALUES 
    (
        gen_random_uuid(),
        demo_user_id,
        'TSLA',
        'Tesla Inc.',
        'buy',
        5,
        200.00,
        1000.00,
        'CAD',
        '2024-01-25T13:20:00Z',
        9.99,
        '2024-01-25T13:20:00Z',
        '2024-01-25T13:20:00Z'
    ),
    (
        gen_random_uuid(),
        demo_user_id,
        'TSLA',
        'Tesla Inc.',
        'buy',
        2,
        180.00,
        360.00,
        'CAD',
        '2024-02-15T16:30:00Z',
        9.99,
        '2024-02-15T16:30:00Z',
        '2024-02-15T16:30:00Z'
    );
    
    -- Insert Microsoft transaction
    INSERT INTO public.transactions (
        id,
        user_id,
        symbol,
        name,
        type,
        quantity,
        price_per_unit,
        total_amount,
        currency,
        transaction_date,
        fees,
        notes,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        demo_user_id,
        'MSFT',
        'Microsoft Corporation',
        'buy',
        8,
        300.00,
        2400.00,
        'CAD',
        '2024-02-05T10:15:00Z',
        9.99,
        'Tech diversification',
        '2024-02-05T10:15:00Z',
        '2024-02-05T10:15:00Z'
    );

    RAISE NOTICE 'Sample transactions inserted successfully for user: %', demo_user_id;
    RAISE NOTICE 'Total transactions inserted: 7';
    RAISE NOTICE 'Symbols: AAPL (3), BTC (1), TSLA (2), MSFT (1)';
    RAISE NOTICE 'User can now view these transactions in the application';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error inserting sample data: %', SQLERRM;
        RAISE NOTICE 'Make sure the transactions table exists and auth.users has at least one user';
        RAISE NOTICE 'Check that RLS policies allow the current user to insert transactions';
END $$;

-- Query to verify the inserted data (optional)
-- Uncomment the following lines to see the inserted transactions
/*
-- Get the first user and show their transactions
WITH first_user AS (
    SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1
)
SELECT 
    t.symbol,
    t.name,
    t.type,
    t.quantity,
    t.price_per_unit,
    t.total_amount,
    t.transaction_date,
    t.fees,
    t.notes
FROM public.transactions t
JOIN first_user u ON t.user_id = u.id
ORDER BY t.transaction_date DESC;

-- Alternative: Show transactions for all users
SELECT 
    u.email,
    t.symbol,
    t.type,
    t.quantity,
    t.price_per_unit,
    t.total_amount,
    t.transaction_date
FROM public.transactions t
JOIN auth.users u ON t.user_id = u.id
ORDER BY u.email, t.transaction_date DESC;
*/
