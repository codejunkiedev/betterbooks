-- Enable RLS and add access policies for business_activity, business_activity_scenario, and scenario tables
-- This migration fixes the unrestricted access issue by enabling proper row-level security

-- Enable RLS on business_activity table
ALTER TABLE public.business_activity ENABLE ROW LEVEL SECURITY;

-- Enable RLS on business_activity_scenario table
ALTER TABLE public.business_activity_scenario ENABLE ROW LEVEL SECURITY;

-- Enable RLS on scenario table
ALTER TABLE public.scenario ENABLE ROW LEVEL SECURITY;

-- Add policies for business_activity table
-- Allow all authenticated users to read business activities (needed for onboarding)
DROP POLICY IF EXISTS business_activity_select_all ON public.business_activity;
CREATE POLICY business_activity_select_all
ON public.business_activity
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Only allow admins to insert/update/delete business activities
DROP POLICY IF EXISTS business_activity_admin_only ON public.business_activity;
CREATE POLICY business_activity_admin_only
ON public.business_activity
FOR ALL
USING (
    auth.uid() IS NOT NULL AND 
    EXISTS (
        SELECT 1 FROM public.admins 
        WHERE admins.user_id = auth.uid() 
        AND admins.is_active = true
    )
)
WITH CHECK (
    auth.uid() IS NOT NULL AND 
    EXISTS (
        SELECT 1 FROM public.admins 
        WHERE admins.user_id = auth.uid() 
        AND admins.is_active = true
    )
);

-- Add policies for business_activity_scenario table
-- Allow all authenticated users to read scenarios (needed for onboarding)
DROP POLICY IF EXISTS business_activity_scenario_select_all ON public.business_activity_scenario;
CREATE POLICY business_activity_scenario_select_all
ON public.business_activity_scenario
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Only allow admins to insert/update/delete scenarios
DROP POLICY IF EXISTS business_activity_scenario_admin_only ON public.business_activity_scenario;
CREATE POLICY business_activity_scenario_admin_only
ON public.business_activity_scenario
FOR ALL
USING (
    auth.uid() IS NOT NULL AND 
    EXISTS (
        SELECT 1 FROM public.admins 
        WHERE admins.user_id = auth.uid() 
        AND admins.is_active = true
    )
)
WITH CHECK (
    auth.uid() IS NOT NULL AND 
    EXISTS (
        SELECT 1 FROM public.admins 
        WHERE admins.user_id = auth.uid() 
        AND admins.is_active = true
    )
);

-- Add policies for scenario table
-- Allow all authenticated users to read scenarios (needed for onboarding)
DROP POLICY IF EXISTS scenario_select_all ON public.scenario;
CREATE POLICY scenario_select_all
ON public.scenario
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Only allow admins to insert/update/delete scenarios
DROP POLICY IF EXISTS scenario_admin_only ON public.scenario;
CREATE POLICY scenario_admin_only
ON public.scenario
FOR ALL
USING (
    auth.uid() IS NOT NULL AND 
    EXISTS (
        SELECT 1 FROM public.admins 
        WHERE admins.user_id = auth.uid() 
        AND admins.is_active = true
    )
)
WITH CHECK (
    auth.uid() IS NOT NULL AND 
    EXISTS (
        SELECT 1 FROM public.admins 
        WHERE admins.user_id = auth.uid() 
        AND admins.is_active = true
    )
);

-- Add helpful indexes for better performance
CREATE INDEX IF NOT EXISTS idx_business_activity_sector ON public.business_activity(sector);
CREATE INDEX IF NOT EXISTS idx_business_activity_scenario_activity_id ON public.business_activity_scenario(business_activity_id);
CREATE INDEX IF NOT EXISTS idx_business_activity_scenario_scenario_id ON public.business_activity_scenario(scenario_id);
