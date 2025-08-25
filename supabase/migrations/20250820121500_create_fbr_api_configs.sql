-- Create FBR API configs table to store user FBR API configuration and status
CREATE TABLE IF NOT EXISTS public.fbr_api_configs (
    id BIGSERIAL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sandbox_api_key TEXT,
    production_api_key TEXT,
    sandbox_status TEXT CHECK (sandbox_status IN ('not_configured','connected','failed')) DEFAULT 'not_configured',
    production_status TEXT CHECK (production_status IN ('not_configured','connected','failed')) DEFAULT 'not_configured',
    last_sandbox_test TIMESTAMP WITH TIME ZONE,
    last_production_test TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_fbr_api_configs_user ON public.fbr_api_configs(user_id);

-- Enable RLS (optional based on access pattern)
ALTER TABLE public.fbr_api_configs ENABLE ROW LEVEL SECURITY;

-- User can manage their own record
DROP POLICY IF EXISTS fbr_api_configs_self ON public.fbr_api_configs;
CREATE POLICY fbr_api_configs_self
ON public.fbr_api_configs
FOR ALL
USING (auth.uid() IS NOT NULL AND user_id = auth.uid())
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid()); 