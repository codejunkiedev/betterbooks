-- Migration: Fix user_business_activities table to add missing columns

-- Add is_primary column if it doesn't exist
ALTER TABLE public.user_business_activities
ADD COLUMN IF NOT EXISTS is_primary boolean DEFAULT false;

-- The table should use business_activity_type_id and sector_id, not business_activity_id
-- The business_activity table was dropped in favor of the normalized structure
-- No need to add business_activity_id column since it references a non-existent table

-- Create unique constraint for the actual columns that exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'user_business_activities_user_id_business_activity_type_id_key'
    ) THEN
        ALTER TABLE public.user_business_activities
        ADD CONSTRAINT user_business_activities_user_id_business_activity_type_id_key
        UNIQUE(user_id, business_activity_type_id);
    END IF;
END $$;

-- Create the index that was failing
CREATE INDEX IF NOT EXISTS idx_user_business_activities_primary ON public.user_business_activities(user_id, is_primary) WHERE is_primary = true;

-- Migrate existing data from fbr_profiles to user_business_activities
-- This will preserve existing business activity assignments using the new structure
DO $$
BEGIN
    -- Check if fbr_profiles has the new structure (business_activity_type_id and sector_id)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'fbr_profiles'
        AND column_name = 'business_activity_type_id'
    ) THEN
        -- Migrate data from fbr_profiles using the new structure
        INSERT INTO public.user_business_activities (user_id, business_activity_type_id, sector_id, is_primary)
        SELECT
            user_id,
            business_activity_type_id,
            sector_id,
            true -- Mark existing activities as primary
        FROM public.fbr_profiles
        WHERE business_activity_type_id IS NOT NULL
        ON CONFLICT (user_id, business_activity_type_id) DO NOTHING;
    ELSE
        RAISE NOTICE 'fbr_profiles does not have business_activity_type_id column - skipping data migration';
    END IF;
END $$;

-- Create a view for easy querying of user business activities with activity details
-- Use the new normalized structure (business_activity_types and sectors)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'business_activity_types'
    ) THEN
        CREATE OR REPLACE VIEW public.user_business_activities_view AS
        SELECT
            uba.id,
            uba.user_id,
            uba.business_activity_type_id,
            uba.sector_id,
            uba.is_primary,
            uba.created_at,
            bat.name as business_activity_type,
            s.name as sector
        FROM public.user_business_activities uba
        LEFT JOIN public.business_activity_types bat ON uba.business_activity_type_id = bat.id
        LEFT JOIN public.sectors s ON uba.sector_id = s.id;
    ELSE
        RAISE NOTICE 'business_activity_types table does not exist - skipping view creation';
    END IF;
END $$;

-- Grant access to the view
GRANT SELECT ON public.user_business_activities_view TO authenticated;

-- Create RLS policy for the view
ALTER VIEW public.user_business_activities_view SET (security_invoker = true);
