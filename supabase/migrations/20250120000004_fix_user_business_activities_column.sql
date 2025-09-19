-- Migration: Fix user_business_activities table to add missing is_primary column

-- Add is_primary column if it doesn't exist
ALTER TABLE public.user_business_activities 
ADD COLUMN IF NOT EXISTS is_primary boolean DEFAULT false;

-- Create the index that was failing
CREATE INDEX IF NOT EXISTS idx_user_business_activities_primary ON public.user_business_activities(user_id, is_primary) WHERE is_primary = true;

-- Migrate existing data from fbr_profiles to user_business_activities
-- This will preserve existing business activity assignments
INSERT INTO public.user_business_activities (user_id, business_activity_id, is_primary)
SELECT 
    user_id, 
    business_activity_id, 
    true -- Mark existing activities as primary
FROM public.fbr_profiles 
WHERE business_activity_id IS NOT NULL
ON CONFLICT (user_id, business_activity_id) DO NOTHING;

-- Create a view for easy querying of user business activities with activity details
CREATE OR REPLACE VIEW public.user_business_activities_view AS
SELECT 
    uba.id,
    uba.user_id,
    uba.business_activity_id,
    uba.is_primary,
    uba.created_at,
    ba.sr,
    ba.business_activity,
    ba.sector
FROM public.user_business_activities uba
JOIN public.business_activity ba ON uba.business_activity_id = ba.id;

-- Grant access to the view
GRANT SELECT ON public.user_business_activities_view TO authenticated;

-- Create RLS policy for the view
ALTER VIEW public.user_business_activities_view SET (security_invoker = true);
