-- Migration: Finalize business activity structure
-- This migration ensures all business activity related tables and functions are properly set up

-- Ensure all required tables exist with proper structure
CREATE TABLE IF NOT EXISTS public.business_activities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sectors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.business_activity_sector_combinations (
    id SERIAL PRIMARY KEY,
    business_activity_id INTEGER NOT NULL REFERENCES public.business_activities(id) ON DELETE CASCADE,
    sector_id INTEGER NOT NULL REFERENCES public.sectors(id) ON DELETE CASCADE,
    sr INTEGER UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(business_activity_id, sector_id)
);

-- Ensure user_business_activities table has the correct structure
ALTER TABLE public.user_business_activities 
ADD COLUMN IF NOT EXISTS business_activity_sector_combination_id INTEGER REFERENCES public.business_activity_sector_combinations(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_business_activities_name ON public.business_activities(name);
CREATE INDEX IF NOT EXISTS idx_sectors_name ON public.sectors(name);
CREATE INDEX IF NOT EXISTS idx_business_activity_sector_combinations_activity ON public.business_activity_sector_combinations(business_activity_id);
CREATE INDEX IF NOT EXISTS idx_business_activity_sector_combinations_sector ON public.business_activity_sector_combinations(sector_id);
CREATE INDEX IF NOT EXISTS idx_business_activity_sector_combinations_sr ON public.business_activity_sector_combinations(sr);
CREATE INDEX IF NOT EXISTS idx_user_business_activities_combination ON public.user_business_activities(business_activity_sector_combination_id);

-- Enable RLS on all tables
ALTER TABLE public.business_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_activity_sector_combinations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS business_activities_select_all ON public.business_activities;
    DROP POLICY IF EXISTS sectors_select_all ON public.sectors;
    DROP POLICY IF EXISTS business_activity_sector_combinations_select_all ON public.business_activity_sector_combinations;
    
    -- Create new policies
    CREATE POLICY business_activities_select_all ON public.business_activities FOR SELECT USING (true);
    CREATE POLICY sectors_select_all ON public.sectors FOR SELECT USING (true);
    CREATE POLICY business_activity_sector_combinations_select_all ON public.business_activity_sector_combinations FOR SELECT USING (true);
EXCEPTION
    WHEN OTHERS THEN
        -- If policies already exist or creation fails, continue
        NULL;
END $$;

-- Insert business activities if they don't exist
INSERT INTO public.business_activities (name, description) VALUES
('Manufacturer', 'Businesses that manufacture products'),
('Importer', 'Businesses that import goods'),
('Distributor', 'Businesses that distribute products'),
('Wholesaler', 'Businesses that sell in wholesale'),
('Exporter', 'Businesses that export goods'),
('Retailer', 'Businesses that sell directly to consumers'),
('Service Provider', 'Businesses that provide services'),
('Other', 'Other types of business activities')
ON CONFLICT (name) DO NOTHING;

-- Insert sectors if they don't exist
INSERT INTO public.sectors (name, description) VALUES
('All Other Sectors', 'General sector for miscellaneous businesses'),
('Steel', 'Steel and metal industry'),
('FMCG', 'Fast Moving Consumer Goods'),
('Textile', 'Textile and clothing industry'),
('Telecom', 'Telecommunications industry'),
('Petroleum', 'Petroleum and oil industry'),
('Electricity Distribution', 'Electricity distribution and utilities'),
('Gas Distribution', 'Gas distribution and utilities'),
('Services', 'Service industry'),
('Automobile', 'Automotive industry'),
('CNG Stations', 'Compressed Natural Gas stations'),
('Pharmaceuticals', 'Pharmaceutical and healthcare industry'),
('Wholesale / Retails', 'Wholesale and retail trade')
ON CONFLICT (name) DO NOTHING;

-- Create business activity sector combinations if they don't exist
-- This creates all possible combinations of business activities and sectors
INSERT INTO public.business_activity_sector_combinations (business_activity_id, sector_id, sr)
SELECT 
    ba.id,
    s.id,
    ROW_NUMBER() OVER (ORDER BY ba.id, s.id) as sr
FROM public.business_activities ba
CROSS JOIN public.sectors s
ON CONFLICT (business_activity_id, sector_id) DO NOTHING;

-- Update sr values to match the original business_activity table if it exists
DO $$
DECLARE
    rec RECORD;
    new_sr INTEGER;
BEGIN
    -- If business_activity table exists, update sr values to match
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_activity' AND table_schema = 'public') THEN
        FOR rec IN 
            SELECT basc.id, ba.name as business_activity, s.name as sector, old_ba.sr
            FROM public.business_activity_sector_combinations basc
            JOIN public.business_activities ba ON basc.business_activity_id = ba.id
            JOIN public.sectors s ON basc.sector_id = s.id
            JOIN public.business_activity old_ba ON old_ba.business_activity = ba.name AND old_ba.sector = s.name
        LOOP
            UPDATE public.business_activity_sector_combinations 
            SET sr = rec.sr 
            WHERE id = rec.id;
        END LOOP;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- If update fails, continue
        NULL;
END $$;

-- Create or update all business activity functions
CREATE OR REPLACE FUNCTION public.get_user_primary_business_activity(p_user_id uuid)
RETURNS TABLE (
    id integer,
    sr integer,
    business_activity varchar,
    sector varchar
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        basc.id,
        basc.sr,
        ba.name as business_activity,
        s.name as sector
    FROM public.user_business_activities uba
    JOIN public.business_activities ba ON uba.business_activity_id = ba.id
    LEFT JOIN public.business_activity_sector_combinations basc ON uba.business_activity_sector_combination_id = basc.id
    LEFT JOIN public.sectors s ON basc.sector_id = s.id
    WHERE uba.user_id = p_user_id 
    AND uba.is_primary = true
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_business_activities(p_user_id uuid)
RETURNS TABLE (
    id integer,
    sr integer,
    business_activity varchar,
    sector varchar,
    is_primary boolean,
    created_at timestamp with time zone
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        basc.id,
        basc.sr,
        ba.name as business_activity,
        s.name as sector,
        uba.is_primary,
        uba.created_at
    FROM public.user_business_activities uba
    JOIN public.business_activities ba ON uba.business_activity_id = ba.id
    LEFT JOIN public.business_activity_sector_combinations basc ON uba.business_activity_sector_combination_id = basc.id
    LEFT JOIN public.sectors s ON basc.sector_id = s.id
    WHERE uba.user_id = p_user_id
    ORDER BY uba.is_primary DESC, uba.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.add_user_business_activity(
    p_user_id uuid,
    p_business_activity_id integer,
    p_is_primary boolean DEFAULT false
)
RETURNS void AS $$
BEGIN
    INSERT INTO public.user_business_activities (user_id, business_activity_id, is_primary)
    VALUES (p_user_id, p_business_activity_id, p_is_primary)
    ON CONFLICT (user_id, business_activity_id) DO UPDATE SET
        is_primary = EXCLUDED.is_primary,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.remove_user_business_activity(
    p_user_id uuid,
    p_business_activity_id integer
)
RETURNS void AS $$
BEGIN
    DELETE FROM public.user_business_activities 
    WHERE user_id = p_user_id AND business_activity_id = p_business_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.set_primary_business_activity(
    p_user_id uuid,
    p_business_activity_id integer
)
RETURNS void AS $$
BEGIN
    -- First, set all activities for this user to non-primary
    UPDATE public.user_business_activities 
    SET is_primary = false, updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Then set the specified activity as primary
    UPDATE public.user_business_activities 
    SET is_primary = true, updated_at = NOW()
    WHERE user_id = p_user_id AND business_activity_id = p_business_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_available_sectors_for_activities(p_business_activity_ids integer[])
RETURNS TABLE (
    id integer,
    name varchar,
    description text
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT s.id, s.name, s.description
    FROM public.sectors s
    JOIN public.business_activity_sector_combinations basc ON s.id = basc.sector_id
    WHERE basc.business_activity_id = ANY(p_business_activity_ids)
    ORDER BY s.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_scenarios_for_combinations(
    p_business_activity_ids integer[],
    p_sector_ids integer[]
)
RETURNS TABLE (
    scenario_id integer
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT bass.scenario_id
    FROM public.business_activity_sector_scenario bass
    JOIN public.business_activity_sector_combinations basc ON bass.business_activity_sector_combination_id = basc.id
    WHERE basc.business_activity_id = ANY(p_business_activity_ids)
    AND basc.sector_id = ANY(p_sector_ids);
EXCEPTION
    WHEN undefined_table THEN
        -- If business_activity_sector_scenario table doesn't exist, return empty result
        RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_user_primary_business_activity(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_business_activities(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_user_business_activity(uuid, integer, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_user_business_activity(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_primary_business_activity(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_available_sectors_for_activities(integer[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_scenarios_for_combinations(integer[], integer[]) TO authenticated;

-- Grant table permissions
GRANT SELECT ON public.business_activities TO authenticated;
GRANT SELECT ON public.sectors TO authenticated;
GRANT SELECT ON public.business_activity_sector_combinations TO authenticated;

-- Add comments
COMMENT ON TABLE public.business_activities IS 'Business activity types (Manufacturer, Importer, etc.)';
COMMENT ON TABLE public.sectors IS 'Business sectors (Steel, FMCG, etc.)';
COMMENT ON TABLE public.business_activity_sector_combinations IS 'Combinations of business activities and sectors with sr field for backward compatibility';
