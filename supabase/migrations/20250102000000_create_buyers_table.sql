-- Create registration type enum
CREATE TYPE public.registration_type AS ENUM ('Registered', 'Unregistered');

-- Create buyers table for invoice buyer management
CREATE TABLE IF NOT EXISTS public.buyers (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    ntn_cnic VARCHAR(13) NOT NULL,
    business_name VARCHAR(100) NOT NULL,
    province_code VARCHAR(10) NOT NULL,
    address TEXT NOT NULL,
    registration_type registration_type NOT NULL,
    is_walk_in BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Constraints
ALTER TABLE public.buyers
    ADD CONSTRAINT buyers_ntn_cnic_format_chk CHECK (ntn_cnic ~ '^[0-9]{7}$|^[0-9]{13}$');

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_buyers_user_ntn ON public.buyers(user_id, ntn_cnic);
CREATE INDEX IF NOT EXISTS idx_buyers_search ON public.buyers(business_name, ntn_cnic);
CREATE INDEX IF NOT EXISTS idx_buyers_user_id ON public.buyers(user_id);

-- Enable RLS and add policies
ALTER TABLE public.buyers ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own buyers
DROP POLICY IF EXISTS buyers_select_own ON public.buyers;
CREATE POLICY buyers_select_own
ON public.buyers
FOR SELECT
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Allow users to insert their own buyers
DROP POLICY IF EXISTS buyers_insert_own ON public.buyers;
CREATE POLICY buyers_insert_own
ON public.buyers
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Allow users to update their own buyers
DROP POLICY IF EXISTS buyers_update_own ON public.buyers;
CREATE POLICY buyers_update_own
ON public.buyers
FOR UPDATE
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Allow users to delete their own buyers
DROP POLICY IF EXISTS buyers_delete_own ON public.buyers;
CREATE POLICY buyers_delete_own
ON public.buyers
FOR DELETE
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_buyers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_buyers_updated_at ON public.buyers;
CREATE TRIGGER trigger_update_buyers_updated_at
    BEFORE UPDATE ON public.buyers
    FOR EACH ROW
    EXECUTE FUNCTION update_buyers_updated_at();
