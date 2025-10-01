-- Migration: Add successful_scenarios column to fbr_profiles table
-- This column will track scenario IDs that users have successfully submitted in sandbox testing

-- Add the successful_scenarios column as a string array
ALTER TABLE public.fbr_profiles 
ADD COLUMN IF NOT EXISTS successful_scenarios TEXT[] DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN public.fbr_profiles.successful_scenarios IS 'Array of scenario IDs that the user has successfully submitted in sandbox testing';