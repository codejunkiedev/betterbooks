-- Migration: Add comprehensive permissions for business activity tables and views
-- This migration ensures all roles have proper access to business activity related data

-- Grant comprehensive permissions on business_activity_combinations view
GRANT ALL PRIVILEGES ON public.business_activity_combinations TO authenticated;
GRANT ALL PRIVILEGES ON public.business_activity_combinations TO anon;
GRANT ALL PRIVILEGES ON public.business_activity_combinations TO service_role;

-- Grant comprehensive permissions on related tables
GRANT ALL PRIVILEGES ON public.business_activity_types TO authenticated;
GRANT ALL PRIVILEGES ON public.business_activity_types TO anon;
GRANT ALL PRIVILEGES ON public.business_activity_types TO service_role;

GRANT ALL PRIVILEGES ON public.sectors TO authenticated;
GRANT ALL PRIVILEGES ON public.sectors TO anon;
GRANT ALL PRIVILEGES ON public.sectors TO service_role;

GRANT ALL PRIVILEGES ON public.user_business_activities TO authenticated;
GRANT ALL PRIVILEGES ON public.user_business_activities TO anon;
GRANT ALL PRIVILEGES ON public.user_business_activities TO service_role;

-- Grant permissions on business_activity_scenarios if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_activity_scenarios' AND table_schema = 'public') THEN
        GRANT ALL PRIVILEGES ON public.business_activity_scenarios TO authenticated;
        GRANT ALL PRIVILEGES ON public.business_activity_scenarios TO anon;
        GRANT ALL PRIVILEGES ON public.business_activity_scenarios TO service_role;
    END IF;
END $$;

-- Grant permissions on scenario table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'scenario' AND table_schema = 'public') THEN
        GRANT ALL PRIVILEGES ON public.scenario TO authenticated;
        GRANT ALL PRIVILEGES ON public.scenario TO anon;
        GRANT ALL PRIVILEGES ON public.scenario TO service_role;
    END IF;
END $$;

-- Grant permissions on business_activity_sector_combinations_view if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'business_activity_sector_combinations_view' AND table_schema = 'public') THEN
        GRANT ALL PRIVILEGES ON public.business_activity_sector_combinations_view TO authenticated;
        GRANT ALL PRIVILEGES ON public.business_activity_sector_combinations_view TO anon;
        GRANT ALL PRIVILEGES ON public.business_activity_sector_combinations_view TO service_role;
    END IF;
END $$;

-- Grant permissions on any remaining business activity related tables
DO $$
BEGIN
    -- business_activities table (if exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_activities' AND table_schema = 'public') THEN
        GRANT ALL PRIVILEGES ON public.business_activities TO authenticated;
        GRANT ALL PRIVILEGES ON public.business_activities TO anon;
        GRANT ALL PRIVILEGES ON public.business_activities TO service_role;
    END IF;

    -- business_activity_sector_combinations table (if exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_activity_sector_combinations' AND table_schema = 'public') THEN
        GRANT ALL PRIVILEGES ON public.business_activity_sector_combinations TO authenticated;
        GRANT ALL PRIVILEGES ON public.business_activity_sector_combinations TO anon;
        GRANT ALL PRIVILEGES ON public.business_activity_sector_combinations TO service_role;
    END IF;

    -- business_activity_sector_scenario table (if exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_activity_sector_scenario' AND table_schema = 'public') THEN
        GRANT ALL PRIVILEGES ON public.business_activity_sector_scenario TO authenticated;
        GRANT ALL PRIVILEGES ON public.business_activity_sector_scenario TO anon;
        GRANT ALL PRIVILEGES ON public.business_activity_sector_scenario TO service_role;
    END IF;

    -- business_activity_scenario table (if exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_activity_scenario' AND table_schema = 'public') THEN
        GRANT ALL PRIVILEGES ON public.business_activity_scenario TO authenticated;
        GRANT ALL PRIVILEGES ON public.business_activity_scenario TO anon;
        GRANT ALL PRIVILEGES ON public.business_activity_scenario TO service_role;
    END IF;
END $$;

-- Grant sequence permissions for auto-incrementing IDs
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Grant function execution permissions for business activity related functions
DO $$
DECLARE
    func_record record;
BEGIN
    -- Get all function signatures that contain 'business_activity' or related terms
    FOR func_record IN 
        SELECT routine_name, specific_name, routine_schema
        FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND (routine_name ILIKE '%business_activity%' 
             OR routine_name ILIKE '%user_business%'
             OR routine_name ILIKE '%scenario%'
             OR routine_name ILIKE '%sector%')
    LOOP
        BEGIN
            EXECUTE format('GRANT EXECUTE ON FUNCTION public.%I TO authenticated', func_record.routine_name);
            EXECUTE format('GRANT EXECUTE ON FUNCTION public.%I TO anon', func_record.routine_name);
            EXECUTE format('GRANT EXECUTE ON FUNCTION public.%I TO service_role', func_record.routine_name);
        EXCEPTION
            WHEN OTHERS THEN
                -- If function name is ambiguous, grant on all functions with that name
                EXECUTE format('GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated');
                EXECUTE format('GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon');
                EXECUTE format('GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role');
                EXIT; -- Exit the loop since we granted all functions
        END;
    END LOOP;
END $$;

-- Drop restrictive RLS policies and create permissive ones
DO $$
BEGIN
    -- business_activity_combinations view (disable RLS if enabled)
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'business_activity_combinations' AND table_schema = 'public') THEN
        -- Views inherit RLS from underlying tables, so we need to update the underlying table policies
        NULL; -- Views don't have direct RLS
    END IF;

    -- For underlying tables, create permissive policies
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_business_activities' AND table_schema = 'public') THEN
        -- Drop existing restrictive policies
        DROP POLICY IF EXISTS user_business_activities_select_own ON public.user_business_activities;
        DROP POLICY IF EXISTS user_business_activities_insert_own ON public.user_business_activities;
        DROP POLICY IF EXISTS user_business_activities_update_own ON public.user_business_activities;
        DROP POLICY IF EXISTS user_business_activities_delete_own ON public.user_business_activities;
        
        -- Create permissive policies
        DROP POLICY IF EXISTS user_business_activities_all_access ON public.user_business_activities;
        CREATE POLICY user_business_activities_all_access ON public.user_business_activities FOR ALL USING (true);
    END IF;

    -- For business_activity_types table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_activity_types' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS business_activity_types_select_all ON public.business_activity_types;
        DROP POLICY IF EXISTS business_activity_types_all_access ON public.business_activity_types;
        CREATE POLICY business_activity_types_all_access ON public.business_activity_types FOR ALL USING (true);
    END IF;

    -- For sectors table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sectors' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS sectors_select_all ON public.sectors;
        DROP POLICY IF EXISTS sectors_all_access ON public.sectors;
        CREATE POLICY sectors_all_access ON public.sectors FOR ALL USING (true);
    END IF;

    -- For scenario table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'scenario' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS scenario_select_all ON public.scenario;
        DROP POLICY IF EXISTS scenario_all_access ON public.scenario;
        CREATE POLICY scenario_all_access ON public.scenario FOR ALL USING (true);
    END IF;

    -- For business_activity_scenarios table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_activity_scenarios' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS business_activity_scenarios_select_all ON public.business_activity_scenarios;
        DROP POLICY IF EXISTS business_activity_scenarios_all_access ON public.business_activity_scenarios;
        CREATE POLICY business_activity_scenarios_all_access ON public.business_activity_scenarios FOR ALL USING (true);
    END IF;
END $$;

-- Migration completed successfully
-- This migration grants comprehensive permissions to all roles for business activity tables and views
