-- Migration: Fix fbr_api_configs table to make old columns nullable
-- This allows the new API key structure to work without violating constraints

-- Make the old api_key and api_secret columns nullable since we're using the new structure
ALTER TABLE public.fbr_api_configs 
ALTER COLUMN api_key DROP NOT NULL,
ALTER COLUMN api_secret DROP NOT NULL;

-- Update existing records to have NULL values for old columns if they don't have values
UPDATE public.fbr_api_configs 
SET 
    api_key = NULL,
    api_secret = NULL
WHERE api_key = '' OR api_secret = '';

-- Add comments to clarify the column usage
COMMENT ON COLUMN public.fbr_api_configs.api_key IS 'Legacy column - use sandbox_api_key and production_api_key instead';
COMMENT ON COLUMN public.fbr_api_configs.api_secret IS 'Legacy column - use sandbox_api_key and production_api_key instead';
