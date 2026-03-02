-- Migration: 002_enable_rls_assets.sql
-- Enable Row Level Security and create policies for assets table

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Optional: enforce RLS even for table owner
-- ALTER TABLE public.assets FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own assets" ON public.assets;
DROP POLICY IF EXISTS "Users can insert their own assets" ON public.assets;
DROP POLICY IF EXISTS "Users can update their own assets" ON public.assets;
DROP POLICY IF EXISTS "Users can delete their own assets" ON public.assets;

CREATE POLICY "Users can view their own assets"
ON public.assets
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assets"
ON public.assets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assets"
ON public.assets
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assets"
ON public.assets
FOR DELETE
USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.assets TO authenticated;