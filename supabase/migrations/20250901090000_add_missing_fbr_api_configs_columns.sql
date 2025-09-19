-- Migration: Add missing columns to fbr_api_configs table
-- This adds the columns that the TypeScript code expects

-- Add missing columns to fbr_api_configs table
ALTER TABLE public.fbr_api_configs 
ADD COLUMN IF NOT EXISTS sandbox_status VARCHAR(50) DEFAULT 'not_configured',
ADD COLUMN IF NOT EXISTS production_status VARCHAR(50) DEFAULT 'not_configured',
ADD COLUMN IF NOT EXISTS last_sandbox_test TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_production_test TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sandbox_api_key TEXT,
ADD COLUMN IF NOT EXISTS production_api_key TEXT;

-- Update existing records to have default status values
UPDATE public.fbr_api_configs 
SET 
    sandbox_status = 'not_configured',
    production_status = 'not_configured'
WHERE sandbox_status IS NULL OR production_status IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.fbr_api_configs.sandbox_status IS 'Status of sandbox API configuration: not_configured, connected, failed';
COMMENT ON COLUMN public.fbr_api_configs.production_status IS 'Status of production API configuration: not_configured, connected, failed';
COMMENT ON COLUMN public.fbr_api_configs.last_sandbox_test IS 'Timestamp of last sandbox API test';
COMMENT ON COLUMN public.fbr_api_configs.last_production_test IS 'Timestamp of last production API test';
COMMENT ON COLUMN public.fbr_api_configs.sandbox_api_key IS 'Encrypted sandbox API key';
COMMENT ON COLUMN public.fbr_api_configs.production_api_key IS 'Encrypted production API key';
