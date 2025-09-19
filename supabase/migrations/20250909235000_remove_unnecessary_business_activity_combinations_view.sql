-- Migration: Remove unnecessary business_activity_combinations view
-- This view is redundant since we can query business_activity_types and sectors directly
-- The business_activity_scenarios table already handles the relationship between activities, sectors, and scenarios

-- Drop the business_activity_combinations view since it's redundant
DROP VIEW IF EXISTS public.business_activity_combinations;

-- Also drop the user business activity combinations view since it's also redundant
-- We can get this data directly from user_business_activities joined with business_activity_types and sectors
DROP VIEW IF EXISTS public.user_business_activity_combinations;

-- Drop the helper functions that used the redundant view
DROP FUNCTION IF EXISTS public.get_business_activity_combinations_with_scenarios();
DROP FUNCTION IF EXISTS public.get_business_activity_combinations_for_types(integer[]);

-- The actual schema we need is clean and simple:
-- 1. business_activity_types (id, name, description)
-- 2. sectors (id, name, description) 
-- 3. scenario (id, code, description, sale_type, category, transaction_type_id)
-- 4. business_activity_scenarios (business_activity_type_id, sector_id, scenario_id)
-- 5. user_business_activities (user_id, business_activity_type_id, sector_id, is_primary)

-- Create a simple function to get scenarios for business activity and sector combinations
CREATE OR REPLACE FUNCTION public.get_scenarios_for_business_activity_and_sector(
    p_business_activity_type_ids integer[],
    p_sector_ids integer[]
)
RETURNS TABLE (
    scenario_id integer,
    scenario_code varchar,
    scenario_description text,
    business_activity_type_id integer,
    business_activity_name text,
    sector_id integer,
    sector_name text
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT
        s.id as scenario_id,
        s.code as scenario_code,
        s.description as scenario_description,
        bat.id as business_activity_type_id,
        bat.name as business_activity_name,
        sec.id as sector_id,
        sec.name as sector_name
    FROM public.business_activity_scenarios bas
    JOIN public.scenario s ON bas.scenario_id = s.id
    JOIN public.business_activity_types bat ON bas.business_activity_type_id = bat.id
    JOIN public.sectors sec ON bas.sector_id = sec.id
    WHERE bat.id = ANY(p_business_activity_type_ids)
    AND sec.id = ANY(p_sector_ids)
    ORDER BY bat.name, sec.name, s.code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get all available sectors for given business activity types
CREATE OR REPLACE FUNCTION public.get_available_sectors_for_business_activity_types(
    p_business_activity_type_ids integer[]
)
RETURNS TABLE (
    sector_id integer,
    sector_name text,
    sector_description text,
    scenario_count bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT
        s.id as sector_id,
        s.name as sector_name,
        s.description as sector_description,
        COUNT(bas.scenario_id) as scenario_count
    FROM public.sectors s
    JOIN public.business_activity_scenarios bas ON s.id = bas.sector_id
    WHERE bas.business_activity_type_id = ANY(p_business_activity_type_ids)
    GROUP BY s.id, s.name, s.description
    ORDER BY s.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions on the new functions
GRANT EXECUTE ON FUNCTION public.get_scenarios_for_business_activity_and_sector(integer[], integer[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_available_sectors_for_business_activity_types(integer[]) TO authenticated;

-- Add comments for clarity
COMMENT ON FUNCTION public.get_scenarios_for_business_activity_and_sector IS 'Get scenarios available for specific business activity types and sectors';
COMMENT ON FUNCTION public.get_available_sectors_for_business_activity_types IS 'Get sectors available for specific business activity types with scenario counts';

-- Display summary
DO $$
BEGIN
    RAISE NOTICE '=== Business Activity Schema Cleanup Completed ===';
    RAISE NOTICE 'Removed redundant business_activity_combinations view';
    RAISE NOTICE 'Schema now uses direct table relationships:';
    RAISE NOTICE '- business_activity_types';
    RAISE NOTICE '- sectors'; 
    RAISE NOTICE '- scenario';
    RAISE NOTICE '- business_activity_scenarios (junction table)';
    RAISE NOTICE '- user_business_activities';
    RAISE NOTICE 'New helper functions created for common queries';
END $$;
