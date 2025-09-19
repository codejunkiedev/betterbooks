-- Migration: Create user_business_activities table and dependencies
-- This migration ensures the table exists before any other migrations try to modify it

-- Create business_activity_types table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.business_activity_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sectors table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.sectors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_business_activities table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_business_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_activity_type_id INTEGER REFERENCES public.business_activity_types(id) ON DELETE CASCADE,
    sector_id INTEGER REFERENCES public.sectors(id) ON DELETE SET NULL,
    is_primary BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, business_activity_type_id)
);

-- Enable RLS
ALTER TABLE public.business_activity_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_business_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public access to reference tables
DROP POLICY IF EXISTS business_activity_types_select_all ON public.business_activity_types;
CREATE POLICY business_activity_types_select_all ON public.business_activity_types FOR SELECT USING (true);

DROP POLICY IF EXISTS sectors_select_all ON public.sectors;
CREATE POLICY sectors_select_all ON public.sectors FOR SELECT USING (true);

-- Create RLS policies for user_business_activities
DROP POLICY IF EXISTS user_business_activities_select_own ON public.user_business_activities;
CREATE POLICY user_business_activities_select_own ON public.user_business_activities
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS user_business_activities_insert_own ON public.user_business_activities;
CREATE POLICY user_business_activities_insert_own ON public.user_business_activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_business_activities_update_own ON public.user_business_activities;
CREATE POLICY user_business_activities_update_own ON public.user_business_activities
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS user_business_activities_delete_own ON public.user_business_activities;
CREATE POLICY user_business_activities_delete_own ON public.user_business_activities
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_business_activities_user_id ON public.user_business_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_business_activities_business_activity_type_id ON public.user_business_activities(business_activity_type_id);
CREATE INDEX IF NOT EXISTS idx_user_business_activities_sector_id ON public.user_business_activities(sector_id) WHERE sector_id IS NOT NULL;

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at trigger to user_business_activities
DROP TRIGGER IF EXISTS user_business_activities_set_updated_at ON public.user_business_activities;
CREATE TRIGGER user_business_activities_set_updated_at
    BEFORE UPDATE ON public.user_business_activities
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Insert default business activity types if they don't exist
INSERT INTO public.business_activity_types (name, description) VALUES
    ('Manufacturer', 'Businesses that manufacture products'),
    ('Importer', 'Businesses that import goods'),
    ('Distributor', 'Businesses that distribute products'),
    ('Wholesaler', 'Businesses that sell in wholesale'),
    ('Exporter', 'Businesses that export goods'),
    ('Retailer', 'Businesses that sell directly to consumers'),
    ('Service Provider', 'Businesses that provide services')
ON CONFLICT (name) DO NOTHING;

-- Insert default sectors if they don't exist
INSERT INTO public.sectors (name, description) VALUES
    ('Agriculture', 'Agricultural and farming activities'),
    ('Manufacturing', 'Manufacturing and industrial activities'),
    ('Services', 'Service-based businesses'),
    ('Trade', 'Trading and commerce activities'),
    ('Technology', 'Technology and IT services'),
    ('Healthcare', 'Healthcare and medical services'),
    ('Education', 'Educational services'),
    ('Construction', 'Construction and real estate'),
    ('Transportation', 'Transportation and logistics'),
    ('Financial Services', 'Banking and financial services')
ON CONFLICT (name) DO NOTHING;

-- Grant permissions
GRANT SELECT ON public.business_activity_types TO authenticated;
GRANT SELECT ON public.sectors TO authenticated;
GRANT ALL ON public.user_business_activities TO authenticated;

-- Grant permissions for sequence objects
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'SUCCESS: user_business_activities table and dependencies created successfully';
END $$;

-- Migration: Cleanup Old Business Activity Tables
-- This migration removes the redundant and confusing tables after data migration

-- Step 1: Drop views first (they depend on tables)
DROP VIEW IF EXISTS public.business_activity_sector_combinations_view;
DROP VIEW IF EXISTS public.user_business_activities_view;

-- Step 2: Drop junction tables
DROP TABLE IF EXISTS public.business_activity_sector_scenario;
DROP TABLE IF EXISTS public.business_activity_scenario;

-- Step 3: Drop foreign key constraints first
ALTER TABLE public.user_business_activities DROP CONSTRAINT IF EXISTS fk_user_business_activities_combination;
ALTER TABLE public.user_business_activities DROP CONSTRAINT IF EXISTS user_business_activities_business_activity_id_fkey;

-- Step 4: Drop redundant tables
DROP TABLE IF EXISTS public.business_activity_sector_combinations;
DROP TABLE IF EXISTS public.business_activity;
DROP TABLE IF EXISTS public.business_activities;

-- Step 5: Update fbr_profiles table to reference the new structure
-- Add new columns for the optimized structure
ALTER TABLE public.fbr_profiles 
ADD COLUMN IF NOT EXISTS business_activity_type_id INTEGER REFERENCES public.business_activity_types(id),
ADD COLUMN IF NOT EXISTS sector_id INTEGER REFERENCES public.sectors(id);

-- Migrate existing business_activity_id to new structure
UPDATE public.fbr_profiles 
SET 
    business_activity_type_id = uba.business_activity_type_id,
    sector_id = uba.sector_id
FROM public.user_business_activities uba
WHERE fbr_profiles.user_id = uba.user_id 
AND uba.is_primary = true
AND fbr_profiles.business_activity_id IS NOT NULL;

-- Drop the old business_activity_id column after migration
ALTER TABLE public.fbr_profiles DROP COLUMN IF EXISTS business_activity_id;

-- Step 6: Update any remaining references in the codebase
-- This will be handled by updating the application code to use the new structure

-- Step 7: Create a simple view for backward compatibility (temporary)
CREATE OR REPLACE VIEW public.business_activity_combinations AS
SELECT 
    uba.id,
    uba.user_id,
    bat.name as business_activity,
    s.name as sector,
    uba.is_primary,
    uba.created_at
FROM public.user_business_activities uba
JOIN public.business_activity_types bat ON uba.business_activity_type_id = bat.id
LEFT JOIN public.sectors s ON uba.sector_id = s.id;

-- Grant access to the compatibility view
GRANT SELECT ON public.business_activity_combinations TO authenticated;

-- Add comment
COMMENT ON VIEW public.business_activity_combinations IS 'Compatibility view for the old business activity structure - will be removed in future migration';
