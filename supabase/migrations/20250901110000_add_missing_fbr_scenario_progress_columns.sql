-- Migration: Add missing columns to fbr_scenario_progress table
-- This adds the columns that the TypeScript code expects

-- Add missing columns to fbr_scenario_progress table
ALTER TABLE public.fbr_scenario_progress 
ADD COLUMN IF NOT EXISTS attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_attempt TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS completion_timestamp TIMESTAMP WITH TIME ZONE;

-- Update existing records to have default values
UPDATE public.fbr_scenario_progress 
SET 
    attempts = 0,
    last_attempt = NULL,
    completion_timestamp = NULL
WHERE attempts IS NULL OR last_attempt IS NULL OR completion_timestamp IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.fbr_scenario_progress.attempts IS 'Number of attempts made for this scenario';
COMMENT ON COLUMN public.fbr_scenario_progress.last_attempt IS 'Timestamp of the last attempt';
COMMENT ON COLUMN public.fbr_scenario_progress.completion_timestamp IS 'Timestamp when the scenario was completed';
