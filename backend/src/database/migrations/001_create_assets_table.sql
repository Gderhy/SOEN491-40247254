-- Migration: 001_create_assets_table.sql
-- Description: Create the assets table for tracking user assets
-- Created: 2026-03-01

-- Create assets table
CREATE TABLE IF NOT EXISTS public.assets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id uuid NOT NULL
        REFERENCES auth.users(id)
        ON DELETE CASCADE,

    type text NOT NULL,
    name text NOT NULL,
    symbol text,

    quantity numeric(20,8),
    value numeric(20,2) NOT NULL CHECK (value >= 0),

    currency text NOT NULL DEFAULT 'CAD',

    provider text,
    source text NOT NULL DEFAULT 'manual',

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

