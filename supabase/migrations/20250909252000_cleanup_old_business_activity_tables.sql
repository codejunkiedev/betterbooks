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
