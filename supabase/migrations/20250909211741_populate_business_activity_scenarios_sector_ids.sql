-- Migration: Populate business_activity_scenarios with sector_id values
-- This migration adds appropriate sector_id values to the business_activity_scenarios table
-- based on existing business activity and sector combinations

-- First, ensure the business_activity_scenarios table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_activity_scenarios' AND table_schema = 'public') THEN
        CREATE TABLE public.business_activity_scenarios (
            id SERIAL PRIMARY KEY,
            business_activity_type_id INTEGER REFERENCES public.business_activity_types(id) ON DELETE CASCADE,
            sector_id INTEGER REFERENCES public.sectors(id) ON DELETE CASCADE,
            scenario_id INTEGER NOT NULL REFERENCES public.scenario(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(business_activity_type_id, sector_id, scenario_id)
        );
    END IF;
END $$;

-- Clear existing data to rebuild with sector_ids
-- TRUNCATE TABLE public.business_activity_scenarios;

-- Populate business_activity_scenarios with comprehensive mappings
-- Based on typical FBR business activity and sector combinations

-- Insert scenarios for Manufacturer business activities across all sectors
INSERT INTO public.business_activity_scenarios (business_activity_type_id, sector_id, scenario_id)
SELECT 
    bat.id as business_activity_type_id,
    s.id as sector_id,
    sc.id as scenario_id
FROM public.business_activity_types bat
CROSS JOIN public.sectors s
CROSS JOIN public.scenario sc
WHERE bat.name = 'Manufacturer'
AND sc.code IN ('SN001', 'SN002', 'SN005', 'SN006', 'SN007', 'SN008') -- Standard Sale, Export Sale, Service Sale, Retail Sale, Wholesale Sale, Manufacturing Sale
ON CONFLICT (business_activity_type_id, sector_id, scenario_id) DO NOTHING;

-- Insert scenarios for Importer business activities across all sectors
INSERT INTO public.business_activity_scenarios (business_activity_type_id, sector_id, scenario_id)
SELECT 
    bat.id as business_activity_type_id,
    s.id as sector_id,
    sc.id as scenario_id
FROM public.business_activity_types bat
CROSS JOIN public.sectors s
CROSS JOIN public.scenario sc
WHERE bat.name = 'Importer'
AND sc.code IN ('SN003', 'SN004', 'SN001', 'SN007') -- Import Purchase, Local Purchase, Standard Sale, Wholesale Sale
ON CONFLICT (business_activity_type_id, sector_id, scenario_id) DO NOTHING;

-- Insert scenarios for Distributor business activities across all sectors
INSERT INTO public.business_activity_scenarios (business_activity_type_id, sector_id, scenario_id)
SELECT 
    bat.id as business_activity_type_id,
    s.id as sector_id,
    sc.id as scenario_id
FROM public.business_activity_types bat
CROSS JOIN public.sectors s
CROSS JOIN public.scenario sc
WHERE bat.name = 'Distributor'
AND sc.code IN ('SN001', 'SN007', 'SN009') -- Standard Sale, Wholesale Sale, Distributor Sale
ON CONFLICT (business_activity_type_id, sector_id, scenario_id) DO NOTHING;

-- Insert scenarios for Wholesaler business activities across all sectors
INSERT INTO public.business_activity_scenarios (business_activity_type_id, sector_id, scenario_id)
SELECT 
    bat.id as business_activity_type_id,
    s.id as sector_id,
    sc.id as scenario_id
FROM public.business_activity_types bat
CROSS JOIN public.sectors s
CROSS JOIN public.scenario sc
WHERE bat.name = 'Wholesaler'
AND sc.code IN ('SN001', 'SN007') -- Standard Sale, Wholesale Sale
ON CONFLICT (business_activity_type_id, sector_id, scenario_id) DO NOTHING;

-- Insert scenarios for Exporter business activities across all sectors
INSERT INTO public.business_activity_scenarios (business_activity_type_id, sector_id, scenario_id)
SELECT 
    bat.id as business_activity_type_id,
    s.id as sector_id,
    sc.id as scenario_id
FROM public.business_activity_types bat
CROSS JOIN public.sectors s
CROSS JOIN public.scenario sc
WHERE bat.name = 'Exporter'
AND sc.code IN ('SN002', 'SN001') -- Export Sale, Standard Sale
ON CONFLICT (business_activity_type_id, sector_id, scenario_id) DO NOTHING;

-- Insert scenarios for Retailer business activities across all sectors
INSERT INTO public.business_activity_scenarios (business_activity_type_id, sector_id, scenario_id)
SELECT 
    bat.id as business_activity_type_id,
    s.id as sector_id,
    sc.id as scenario_id
FROM public.business_activity_types bat
CROSS JOIN public.sectors s
CROSS JOIN public.scenario sc
WHERE bat.name = 'Retailer'
AND sc.code IN ('SN006', 'SN001') -- Retail Sale, Standard Sale
ON CONFLICT (business_activity_type_id, sector_id, scenario_id) DO NOTHING;

-- Insert scenarios for Service Provider business activities across all sectors
INSERT INTO public.business_activity_scenarios (business_activity_type_id, sector_id, scenario_id)
SELECT 
    bat.id as business_activity_type_id,
    s.id as sector_id,
    sc.id as scenario_id
FROM public.business_activity_types bat
CROSS JOIN public.sectors s
CROSS JOIN public.scenario sc
WHERE bat.name = 'Service Provider'
AND sc.code IN ('SN005', 'SN010') -- Service Sale, Agent Commission
ON CONFLICT (business_activity_type_id, sector_id, scenario_id) DO NOTHING;

-- Insert scenarios for Other business activities across all sectors
INSERT INTO public.business_activity_scenarios (business_activity_type_id, sector_id, scenario_id)
SELECT 
    bat.id as business_activity_type_id,
    s.id as sector_id,
    sc.id as scenario_id
FROM public.business_activity_types bat
CROSS JOIN public.sectors s
CROSS JOIN public.scenario sc
WHERE bat.name = 'Other'
AND sc.code IN ('SN001', 'SN005', 'SN006') -- Standard Sale, Service Sale, Retail Sale
ON CONFLICT (business_activity_type_id, sector_id, scenario_id) DO NOTHING;

-- Add specific sector-based scenario mappings for specialized sectors

-- CNG Stations specific scenarios
INSERT INTO public.business_activity_scenarios (business_activity_type_id, sector_id, scenario_id)
SELECT 
    bat.id as business_activity_type_id,
    s.id as sector_id,
    sc.id as scenario_id
FROM public.business_activity_types bat
CROSS JOIN public.sectors s
CROSS JOIN public.scenario sc
WHERE s.name = 'CNG Stations'
AND sc.code IN ('SN006') -- Retail Sale for CNG stations
ON CONFLICT (business_activity_type_id, sector_id, scenario_id) DO NOTHING;

-- Electricity Distribution specific scenarios
INSERT INTO public.business_activity_scenarios (business_activity_type_id, sector_id, scenario_id)
SELECT 
    bat.id as business_activity_type_id,
    s.id as sector_id,
    sc.id as scenario_id
FROM public.business_activity_types bat
CROSS JOIN public.sectors s
CROSS JOIN public.scenario sc
WHERE s.name = 'Electricity Distribution'
AND sc.code IN ('SN005') -- Service Sale for utilities
ON CONFLICT (business_activity_type_id, sector_id, scenario_id) DO NOTHING;

-- Gas Distribution specific scenarios
INSERT INTO public.business_activity_scenarios (business_activity_type_id, sector_id, scenario_id)
SELECT 
    bat.id as business_activity_type_id,
    s.id as sector_id,
    sc.id as scenario_id
FROM public.business_activity_types bat
CROSS JOIN public.sectors s
CROSS JOIN public.scenario sc
WHERE s.name = 'Gas Distribution'
AND sc.code IN ('SN005') -- Service Sale for utilities
ON CONFLICT (business_activity_type_id, sector_id, scenario_id) DO NOTHING;

-- Telecom specific scenarios
INSERT INTO public.business_activity_scenarios (business_activity_type_id, sector_id, scenario_id)
SELECT 
    bat.id as business_activity_type_id,
    s.id as sector_id,
    sc.id as scenario_id
FROM public.business_activity_types bat
CROSS JOIN public.sectors s
CROSS JOIN public.scenario sc
WHERE s.name = 'Telecom'
AND sc.code IN ('SN005', 'SN006') -- Service Sale, Retail Sale for telecom
ON CONFLICT (business_activity_type_id, sector_id, scenario_id) DO NOTHING;

-- Services sector specific scenarios
INSERT INTO public.business_activity_scenarios (business_activity_type_id, sector_id, scenario_id)
SELECT 
    bat.id as business_activity_type_id,
    s.id as sector_id,
    sc.id as scenario_id
FROM public.business_activity_types bat
CROSS JOIN public.sectors s
CROSS JOIN public.scenario sc
WHERE s.name = 'Services'
AND sc.code IN ('SN005', 'SN010') -- Service Sale, Agent Commission
ON CONFLICT (business_activity_type_id, sector_id, scenario_id) DO NOTHING;

-- Add additional common scenarios for all sectors if they exist
DO $$
DECLARE
    additional_scenarios text[] := ARRAY['SN011', 'SN012', 'SN013', 'SN014', 'SN015', 'SN016', 'SN017', 'SN018', 'SN019', 'SN020'];
    scenario_code text;
BEGIN
    FOREACH scenario_code IN ARRAY additional_scenarios
    LOOP
        -- Add these scenarios to "All Other Sectors" for all business activity types
        INSERT INTO public.business_activity_scenarios (business_activity_type_id, sector_id, scenario_id)
        SELECT 
            bat.id as business_activity_type_id,
            s.id as sector_id,
            sc.id as scenario_id
        FROM public.business_activity_types bat
        CROSS JOIN public.sectors s
        CROSS JOIN public.scenario sc
        WHERE s.name = 'All Other Sectors'
        AND sc.code = scenario_code
        ON CONFLICT (business_activity_type_id, sector_id, scenario_id) DO NOTHING;
    END LOOP;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_business_activity_scenarios_business_activity_type ON public.business_activity_scenarios(business_activity_type_id);
CREATE INDEX IF NOT EXISTS idx_business_activity_scenarios_sector ON public.business_activity_scenarios(sector_id);
CREATE INDEX IF NOT EXISTS idx_business_activity_scenarios_scenario ON public.business_activity_scenarios(scenario_id);
CREATE INDEX IF NOT EXISTS idx_business_activity_scenarios_lookup ON public.business_activity_scenarios(business_activity_type_id, sector_id);

-- Add comment
COMMENT ON TABLE public.business_activity_scenarios IS 'Scenarios applicable to specific business activity types and sectors based on FBR requirements';

-- Grant permissions
GRANT ALL PRIVILEGES ON public.business_activity_scenarios TO authenticated;
GRANT ALL PRIVILEGES ON public.business_activity_scenarios TO anon;
GRANT ALL PRIVILEGES ON public.business_activity_scenarios TO service_role;

-- Display summary of populated data
DO $$
DECLARE
    total_scenarios INTEGER;
    total_combinations INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_scenarios FROM public.business_activity_scenarios;
    SELECT COUNT(*) INTO total_combinations 
    FROM public.business_activity_types bat 
    CROSS JOIN public.sectors s;
    
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'Total business activity scenarios populated: %', total_scenarios;
    RAISE NOTICE 'Total possible business activity + sector combinations: %', total_combinations;
END $$;
