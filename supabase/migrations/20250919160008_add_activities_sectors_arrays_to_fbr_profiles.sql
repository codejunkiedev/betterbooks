-- Migration: Add activities and sectors TEXT array columns to fbr_profiles table
-- These columns will store arrays of activity and sector names from the API

-- Add activities and sectors columns as TEXT arrays
ALTER TABLE public.fbr_profiles
ADD COLUMN IF NOT EXISTS activities TEXT[],
ADD COLUMN IF NOT EXISTS sectors TEXT[];

-- Add comments to document the expected format
COMMENT ON COLUMN public.fbr_profiles.activities IS 'Array of business activity names from FBR API, e.g., ["Manufacturer", "Importer", "Wholesaler"]';
COMMENT ON COLUMN public.fbr_profiles.sectors IS 'Array of business sector names from FBR API, e.g., ["FMCG", "Petroleum"]';