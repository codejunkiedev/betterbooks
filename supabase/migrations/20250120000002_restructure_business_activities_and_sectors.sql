-- Migration: Restructure business activities and sectors for independent selection
-- This separates business activities from sectors and allows independent selection

-- Create new business_activities table (without sectors)
CREATE TABLE IF NOT EXISTS public.business_activities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create new sectors table
CREATE TABLE IF NOT EXISTS public.sectors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create business_activity_sector_combinations table
-- This replaces the old business_activity table and allows flexible combinations
CREATE TABLE IF NOT EXISTS public.business_activity_sector_combinations (
    id SERIAL PRIMARY KEY,
    business_activity_id INTEGER NOT NULL REFERENCES public.business_activities(id) ON DELETE CASCADE,
    sector_id INTEGER NOT NULL REFERENCES public.sectors(id) ON DELETE CASCADE,
    sr INTEGER UNIQUE NOT NULL, -- Keep the old sr field for backward compatibility
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(business_activity_id, sector_id)
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_business_activity_sector_combinations_activity ON public.business_activity_sector_combinations(business_activity_id);
CREATE INDEX IF NOT EXISTS idx_business_activity_sector_combinations_sector ON public.business_activity_sector_combinations(sector_id);

-- Insert business activities
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

-- Insert sectors
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

-- Create combinations based on the old data structure
-- This maintains backward compatibility while allowing the new structure
INSERT INTO public.business_activity_sector_combinations (business_activity_id, sector_id, sr)
SELECT 
    ba.id,
    s.id,
    old_ba.sr
FROM public.business_activity old_ba
JOIN public.business_activities ba ON ba.name = old_ba.business_activity
JOIN public.sectors s ON s.name = old_ba.sector
ON CONFLICT (business_activity_id, sector_id) DO NOTHING;

-- Update the business_activity_scenario table to reference the new combinations
-- First, let's create a mapping from old business_activity.id to new combination.id
CREATE TEMP TABLE business_activity_mapping AS
SELECT 
    old_ba.id as old_id,
    new_comb.id as new_id
FROM public.business_activity old_ba
JOIN public.business_activity_sector_combinations new_comb ON new_comb.sr = old_ba.sr;

-- Note: scenario table is created in foundation migration 20250101000001_create_scenario_table_early.sql

-- Create new junction table for scenarios
CREATE TABLE IF NOT EXISTS public.business_activity_sector_scenario (
    business_activity_sector_combination_id INT NOT NULL REFERENCES public.business_activity_sector_combinations(id) ON DELETE CASCADE,
    scenario_id INT NOT NULL REFERENCES public.scenario(id) ON DELETE CASCADE,
    PRIMARY KEY (business_activity_sector_combination_id, scenario_id)
);

-- Migrate existing scenario relationships (only if source table exists)
DO $$
BEGIN
    -- Check if the business_activity_scenario table exists before trying to migrate data
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_activity_scenario' AND table_schema = 'public') THEN
        INSERT INTO public.business_activity_sector_scenario (business_activity_sector_combination_id, scenario_id)
        SELECT 
            mapping.new_id,
            bas.scenario_id
        FROM public.business_activity_scenario bas
        JOIN business_activity_mapping mapping ON mapping.old_id = bas.business_activity_id
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Create indexes for the new scenario table
CREATE INDEX IF NOT EXISTS idx_business_activity_sector_scenario_combination ON public.business_activity_sector_scenario(business_activity_sector_combination_id);
CREATE INDEX IF NOT EXISTS idx_business_activity_sector_scenario_scenario ON public.business_activity_sector_scenario(scenario_id);

-- Update user_business_activities table to reference the new combinations
-- First, create a temporary column to store the new combination IDs
ALTER TABLE public.user_business_activities ADD COLUMN IF NOT EXISTS business_activity_sector_combination_id INTEGER;

-- Update the new column with the correct combination IDs
-- Check if business_activity_id column exists (from migration 20250120000000)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'user_business_activities'
        AND column_name = 'business_activity_id'
    ) THEN
        UPDATE public.user_business_activities
        SET business_activity_sector_combination_id = mapping.new_id
        FROM business_activity_mapping mapping
        WHERE user_business_activities.business_activity_id = mapping.old_id;
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'user_business_activities'
        AND column_name = 'business_activity_type_id'
    ) THEN
        -- Handle the case where we have business_activity_type_id instead
        -- This would need proper mapping from business_activity_types to the new structure
        -- For now, we'll skip the update as the mapping would be different
        RAISE NOTICE 'user_business_activities table has business_activity_type_id column - manual migration may be required';
    END IF;
END $$;

-- Add foreign key constraint for the new column
ALTER TABLE public.user_business_activities 
ADD CONSTRAINT fk_user_business_activities_combination 
FOREIGN KEY (business_activity_sector_combination_id) 
REFERENCES public.business_activity_sector_combinations(id) ON DELETE CASCADE;

-- Create index for the new column
CREATE INDEX IF NOT EXISTS idx_user_business_activities_combination ON public.user_business_activities(business_activity_sector_combination_id);

-- Enable RLS on new tables
ALTER TABLE public.business_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_activity_sector_combinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_activity_sector_scenario ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables
CREATE POLICY business_activities_select_all ON public.business_activities FOR SELECT USING (true);
CREATE POLICY sectors_select_all ON public.sectors FOR SELECT USING (true);
CREATE POLICY business_activity_sector_combinations_select_all ON public.business_activity_sector_combinations FOR SELECT USING (true);
CREATE POLICY business_activity_sector_scenario_select_all ON public.business_activity_sector_scenario FOR SELECT USING (true);

-- Create views for easy querying
CREATE OR REPLACE VIEW public.business_activity_sector_combinations_view AS
SELECT 
    comb.id,
    comb.sr,
    ba.name as business_activity,
    s.name as sector,
    ba.description as business_activity_description,
    s.description as sector_description,
    comb.created_at
FROM public.business_activity_sector_combinations comb
JOIN public.business_activities ba ON comb.business_activity_id = ba.id
JOIN public.sectors s ON comb.sector_id = s.id;

-- Grant access to the view
GRANT SELECT ON public.business_activity_sector_combinations_view TO authenticated;

-- Create function to get scenarios for business activity and sector combinations
CREATE OR REPLACE FUNCTION public.get_scenarios_for_combinations(
    p_business_activity_ids INTEGER[],
    p_sector_ids INTEGER[]
)
RETURNS TABLE (
    scenario_id INTEGER,
    scenario_code VARCHAR,
    business_activity VARCHAR,
    sector VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT
        s.id as scenario_id,
        s.code as scenario_code,
        ba.name as business_activity,
        sec.name as sector
    FROM public.scenario s
    JOIN public.business_activity_sector_scenario bass ON s.id = bass.scenario_id
    JOIN public.business_activity_sector_combinations comb ON bass.business_activity_sector_combination_id = comb.id
    JOIN public.business_activities ba ON comb.business_activity_id = ba.id
    JOIN public.sectors sec ON comb.sector_id = sec.id
    WHERE ba.id = ANY(p_business_activity_ids)
    AND sec.id = ANY(p_sector_ids)
    ORDER BY s.code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get available sectors for selected business activities
CREATE OR REPLACE FUNCTION public.get_available_sectors_for_activities(
    p_business_activity_ids INTEGER[]
)
RETURNS TABLE (
    sector_id INTEGER,
    sector_name VARCHAR,
    business_activity VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT
        s.id as sector_id,
        s.name as sector_name,
        ba.name as business_activity
    FROM public.sectors s
    JOIN public.business_activity_sector_combinations comb ON s.id = comb.sector_id
    JOIN public.business_activities ba ON comb.business_activity_id = ba.id
    WHERE ba.id = ANY(p_business_activity_ids)
    ORDER BY s.name, ba.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments
COMMENT ON TABLE public.business_activities IS 'Available business activity types (Manufacturer, Importer, etc.)';
COMMENT ON TABLE public.sectors IS 'Available business sectors (Steel, FMCG, etc.)';
COMMENT ON TABLE public.business_activity_sector_combinations IS 'Valid combinations of business activities and sectors';
COMMENT ON TABLE public.business_activity_sector_scenario IS 'Scenarios applicable to specific business activity and sector combinations';
COMMENT ON FUNCTION public.get_scenarios_for_combinations IS 'Get all applicable scenarios for given business activities and sectors';
COMMENT ON FUNCTION public.get_available_sectors_for_activities IS 'Get all available sectors for given business activities';
