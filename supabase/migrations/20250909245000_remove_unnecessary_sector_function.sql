-- Migration: Remove unnecessary get_available_sectors_for_business_activity_types function
-- We can handle this logic in the frontend code instead

-- Drop the function that's causing type mismatch issues
DROP FUNCTION IF EXISTS public.get_available_sectors_for_business_activity_types(integer[]);

-- Keep only the essential function for getting scenarios
-- Fix the return type to avoid varchar/text mismatch
DROP FUNCTION IF EXISTS public.get_scenarios_for_business_activity_and_sector(integer[], integer[]);

CREATE OR REPLACE FUNCTION public.get_scenarios_for_business_activity_and_sector(
    p_business_activity_type_ids integer[],
    p_sector_ids integer[]
)
RETURNS TABLE (
    scenario_id integer,
    scenario_code text,
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
        s.code::text as scenario_code,
        s.description::text as scenario_description,
        bat.id as business_activity_type_id,
        bat.name::text as business_activity_name,
        sec.id as sector_id,
        sec.name::text as sector_name
    FROM public.business_activity_scenarios bas
    JOIN public.scenario s ON bas.scenario_id = s.id
    JOIN public.business_activity_types bat ON bas.business_activity_type_id = bat.id
    JOIN public.sectors sec ON bas.sector_id = sec.id
    WHERE bat.id = ANY(p_business_activity_type_ids)
    AND sec.id = ANY(p_sector_ids)
    ORDER BY bat.name, sec.name, s.code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_scenarios_for_business_activity_and_sector(integer[], integer[]) TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.get_scenarios_for_business_activity_and_sector IS 'Get scenarios available for specific business activity types and sectors with proper text types';

-- Migration completed successfully
