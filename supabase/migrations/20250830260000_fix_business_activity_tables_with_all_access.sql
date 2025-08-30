-- Fix business_activity, business_activity_scenario, and scenario tables with all access
-- This migration handles cases where tables might not exist and provides comprehensive access

-- Fix business_activity table
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'business_activity') THEN
        -- Enable RLS
        ALTER TABLE public.business_activity ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS business_activity_select_all ON public.business_activity;
        DROP POLICY IF EXISTS business_activity_admin_only ON public.business_activity;
        DROP POLICY IF EXISTS business_activity_all_access ON public.business_activity;
        
        -- Create comprehensive all access policy
        CREATE POLICY business_activity_all_access ON public.business_activity
            FOR ALL
            USING (true)
            WITH CHECK (true);
            
        RAISE NOTICE 'Fixed business_activity table with all access';
    ELSE
        RAISE NOTICE 'business_activity table does not exist yet';
    END IF;
END $$;

-- Fix business_activity_scenario table
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'business_activity_scenario') THEN
        -- Enable RLS
        ALTER TABLE public.business_activity_scenario ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS business_activity_scenario_select_all ON public.business_activity_scenario;
        DROP POLICY IF EXISTS business_activity_scenario_admin_only ON public.business_activity_scenario;
        DROP POLICY IF EXISTS business_activity_scenario_all_access ON public.business_activity_scenario;
        
        -- Create comprehensive all access policy
        CREATE POLICY business_activity_scenario_all_access ON public.business_activity_scenario
            FOR ALL
            USING (true)
            WITH CHECK (true);
            
        RAISE NOTICE 'Fixed business_activity_scenario table with all access';
    ELSE
        RAISE NOTICE 'business_activity_scenario table does not exist yet';
    END IF;
END $$;

-- Fix scenario table
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'scenario') THEN
        -- Enable RLS
        ALTER TABLE public.scenario ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS scenario_select_all ON public.scenario;
        DROP POLICY IF EXISTS scenario_admin_only ON public.scenario;
        DROP POLICY IF EXISTS scenario_all_access ON public.scenario;
        
        -- Create comprehensive all access policy
        CREATE POLICY scenario_all_access ON public.scenario
            FOR ALL
            USING (true)
            WITH CHECK (true);
            
        RAISE NOTICE 'Fixed scenario table with all access';
    ELSE
        RAISE NOTICE 'scenario table does not exist yet';
    END IF;
END $$;

-- Create helpful indexes if tables exist
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'business_activity') THEN
        CREATE INDEX IF NOT EXISTS idx_business_activity_sector ON public.business_activity(sector);
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'business_activity_scenario') THEN
        CREATE INDEX IF NOT EXISTS idx_business_activity_scenario_activity_id ON public.business_activity_scenario(business_activity_id);
        CREATE INDEX IF NOT EXISTS idx_business_activity_scenario_scenario_id ON public.business_activity_scenario(scenario_id);
    END IF;
END $$;
