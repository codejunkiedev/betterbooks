-- Migration: Fix business_activity_scenarios sector mapping based on FBR API documentation
-- This migration correctly maps sector_id values based on business_activity_type_id 
-- following the FBR API documentation patterns from fbr_documentation/fbr api.pdf

-- Clear existing business_activity_scenarios data and rebuild with correct sector mappings
TRUNCATE TABLE public.business_activity_scenarios RESTART IDENTITY CASCADE;

-- ==================================================================================
-- MANUFACTURER BUSINESS ACTIVITY SCENARIOS
-- ==================================================================================

-- Manufacturer + All Other Sectors (SR 1) -> SN001, SN002, SN005, SN006
INSERT INTO public.business_activity_scenarios (business_activity_type_id, sector_id, scenario_id)
SELECT 
    bat.id as business_activity_type_id,
    s.id as sector_id,
    sc.id as scenario_id
FROM public.business_activity_types bat
JOIN public.sectors s ON s.name = 'All Other Sectors'
JOIN public.scenario sc ON sc.code IN ('SN001', 'SN002', 'SN005', 'SN006')
WHERE bat.name = 'Manufacturer'
ON CONFLICT (business_activity_type_id, sector_id, scenario_id) DO NOTHING;

-- Manufacturer + Steel (SR 2) -> SN001, SN002, SN005, SN006, SN008
INSERT INTO public.business_activity_scenarios (business_activity_type_id, sector_id, scenario_id)
SELECT 
    bat.id as business_activity_type_id,
    s.id as sector_id,
    sc.id as scenario_id
FROM public.business_activity_types bat
JOIN public.sectors s ON s.name = 'Steel'
JOIN public.scenario sc ON sc.code IN ('SN001', 'SN002', 'SN005', 'SN006', 'SN008')
WHERE bat.name = 'Manufacturer'
ON CONFLICT (business_activity_type_id, sector_id, scenario_id) DO NOTHING;

-- Manufacturer + FMCG (SR 3) -> SN001, SN002, SN005, SN006, SN007, SN008
INSERT INTO public.business_activity_scenarios (business_activity_type_id, sector_id, scenario_id)
SELECT 
    bat.id as business_activity_type_id,
    s.id as sector_id,
    sc.id as scenario_id
FROM public.business_activity_types bat
JOIN public.sectors s ON s.name = 'FMCG'
JOIN public.scenario sc ON sc.code IN ('SN001', 'SN002', 'SN005', 'SN006', 'SN007', 'SN008')
WHERE bat.name = 'Manufacturer'
ON CONFLICT (business_activity_type_id, sector_id, scenario_id) DO NOTHING;

-- Manufacturer + Textile (SR 4) -> SN001, SN002, SN006, SN008
INSERT INTO public.business_activity_scenarios (business_activity_type_id, sector_id, scenario_id)
SELECT 
    bat.id as business_activity_type_id,
    s.id as sector_id,
    sc.id as scenario_id
FROM public.business_activity_types bat
JOIN public.sectors s ON s.name = 'Textile'
JOIN public.scenario sc ON sc.code IN ('SN001', 'SN002', 'SN006', 'SN008')
WHERE bat.name = 'Manufacturer'
ON CONFLICT (business_activity_type_id, sector_id, scenario_id) DO NOTHING;

-- Manufacturer + Telecom (SR 5) -> SN001, SN005, SN008
INSERT INTO public.business_activity_scenarios (business_activity_type_id, sector_id, scenario_id)
SELECT 
    bat.id as business_activity_type_id,
    s.id as sector_id,
    sc.id as scenario_id
FROM public.business_activity_types bat
JOIN public.sectors s ON s.name = 'Telecom'
JOIN public.scenario sc ON sc.code IN ('SN001', 'SN005', 'SN008')
WHERE bat.name = 'Manufacturer'
ON CONFLICT (business_activity_type_id, sector_id, scenario_id) DO NOTHING;

-- Manufacturer + Petroleum (SR 6) -> SN001, SN002, SN008
INSERT INTO public.business_activity_scenarios (business_activity_type_id, sector_id, scenario_id)
SELECT 
    bat.id as business_activity_type_id,
    s.id as sector_id,
    sc.id as scenario_id
FROM public.business_activity_types bat
JOIN public.sectors s ON s.name = 'Petroleum'
JOIN public.scenario sc ON sc.code IN ('SN001', 'SN002', 'SN008')
WHERE bat.name = 'Manufacturer'
ON CONFLICT (business_activity_type_id, sector_id, scenario_id) DO NOTHING;

-- Manufacturer + Automobile (SR 10) -> SN001, SN002, SN006, SN008
INSERT INTO public.business_activity_scenarios (business_activity_type_id, sector_id, scenario_id)
SELECT 
    bat.id as business_activity_type_id,
    s.id as sector_id,
    sc.id as scenario_id
FROM public.business_activity_types bat
JOIN public.sectors s ON s.name = 'Automobile'
JOIN public.scenario sc ON sc.code IN ('SN001', 'SN002', 'SN006', 'SN008')
WHERE bat.name = 'Manufacturer'
ON CONFLICT (business_activity_type_id, sector_id, scenario_id) DO NOTHING;

-- Manufacturer + Pharmaceuticals (SR 12) -> SN001, SN002, SN005, SN006, SN008
INSERT INTO public.business_activity_scenarios (business_activity_type_id, sector_id, scenario_id)
SELECT 
    bat.id as business_activity_type_id,
    s.id as sector_id,
    sc.id as scenario_id
FROM public.business_activity_types bat
JOIN public.sectors s ON s.name = 'Pharmaceuticals'
JOIN public.scenario sc ON sc.code IN ('SN001', 'SN002', 'SN005', 'SN006', 'SN008')
WHERE bat.name = 'Manufacturer'
ON CONFLICT (business_activity_type_id, sector_id, scenario_id) DO NOTHING;

-- ==================================================================================
-- IMPORTER BUSINESS ACTIVITY SCENARIOS  
-- ==================================================================================

-- Importer + All Other Sectors (SR 16) -> SN003, SN004, SN001
INSERT INTO public.business_activity_scenarios (business_activity_type_id, sector_id, scenario_id)
SELECT 
    bat.id as business_activity_type_id,
    s.id as sector_id,
    sc.id as scenario_id
FROM public.business_activity_types bat
JOIN public.sectors s ON s.name = 'All Other Sectors'
JOIN public.scenario sc ON sc.code IN ('SN003', 'SN004', 'SN001')
WHERE bat.name = 'Importer'
ON CONFLICT (business_activity_type_id, sector_id, scenario_id) DO NOTHING;

-- Importer + Steel (SR 17) -> SN003, SN004, SN001
INSERT INTO public.business_activity_scenarios (business_activity_type_id, sector_id, scenario_id)
SELECT 
    bat.id as business_activity_type_id,
    s.id as sector_id,
    sc.id as scenario_id
FROM public.business_activity_types bat
JOIN public.sectors s ON s.name = 'Steel'
JOIN public.scenario sc ON sc.code IN ('SN003', 'SN004', 'SN001')
WHERE bat.name = 'Importer'
ON CONFLICT (business_activity_type_id, sector_id, scenario_id) DO NOTHING;

-- Importer + FMCG (SR 18) -> SN003, SN004, SN001, SN007
INSERT INTO public.business_activity_scenarios (business_activity_type_id, sector_id, scenario_id)
SELECT 
    bat.id as business_activity_type_id,
    s.id as sector_id,
    sc.id as scenario_id
FROM public.business_activity_types bat
JOIN public.sectors s ON s.name = 'FMCG'
JOIN public.scenario sc ON sc.code IN ('SN003', 'SN004', 'SN001', 'SN007')
WHERE bat.name = 'Importer'
ON CONFLICT (business_activity_type_id, sector_id, scenario_id) DO NOTHING;

-- Importer + Textile (SR 19) -> SN003, SN004, SN001
INSERT INTO public.business_activity_scenarios (business_activity_type_id, sector_id, scenario_id)
SELECT 
    bat.id as business_activity_type_id,
    s.id as sector_id,
    sc.id as scenario_id
FROM public.business_activity_types bat
JOIN public.sectors s ON s.name = 'Textile'
JOIN public.scenario sc ON sc.code IN ('SN003', 'SN004', 'SN001')
WHERE bat.name = 'Importer'
ON CONFLICT (business_activity_type_id, sector_id, scenario_id) DO NOTHING;

-- Importer + Automobile (SR 25) -> SN003, SN004, SN001
INSERT INTO public.business_activity_scenarios (business_activity_type_id, sector_id, scenario_id)
SELECT 
    bat.id as business_activity_type_id,
    s.id as sector_id,
    sc.id as scenario_id
FROM public.business_activity_types bat
JOIN public.sectors s ON s.name = 'Automobile'
JOIN public.scenario sc ON sc.code IN ('SN003', 'SN004', 'SN001')
WHERE bat.name = 'Importer'
ON CONFLICT (business_activity_type_id, sector_id, scenario_id) DO NOTHING;

-- Importer + Pharmaceuticals (SR 27) -> SN003, SN004, SN001
INSERT INTO public.business_activity_scenarios (business_activity_type_id, sector_id, scenario_id)
SELECT 
    bat.id as business_activity_type_id,
    s.id as sector_id,
    sc.id as scenario_id
FROM public.business_activity_types bat
JOIN public.sectors s ON s.name = 'Pharmaceuticals'
JOIN public.scenario sc ON sc.code IN ('SN003', 'SN004', 'SN001')
WHERE bat.name = 'Importer'
ON CONFLICT (business_activity_type_id, sector_id, scenario_id) DO NOTHING;

-- ==================================================================================
-- DISTRIBUTOR BUSINESS ACTIVITY SCENARIOS
-- ==================================================================================

-- Distributor + All Other Sectors (SR 31) -> SN001, SN007, SN009
INSERT INTO public.business_activity_scenarios (business_activity_type_id, sector_id, scenario_id)
SELECT 
    bat.id as business_activity_type_id,
    s.id as sector_id,
    sc.id as scenario_id
FROM public.business_activity_types bat
JOIN public.sectors s ON s.name = 'All Other Sectors'
JOIN public.scenario sc ON sc.code IN ('SN001', 'SN007', 'SN009')
WHERE bat.name = 'Distributor'
ON CONFLICT (business_activity_type_id, sector_id, scenario_id) DO NOTHING;

-- Distributor + FMCG (SR 33) -> SN001, SN007, SN009
INSERT INTO public.business_activity_scenarios (business_activity_type_id, sector_id, scenario_id)
SELECT 
    bat.id as business_activity_type_id,
    s.id as sector_id,
    sc.id as scenario_id
FROM public.business_activity_types bat
JOIN public.sectors s ON s.name = 'FMCG'
JOIN public.scenario sc ON sc.code IN ('SN001', 'SN007', 'SN009')
WHERE bat.name = 'Distributor'
ON CONFLICT (business_activity_type_id, sector_id, scenario_id) DO NOTHING;

-- ==================================================================================
-- WHOLESALER BUSINESS ACTIVITY SCENARIOS
-- ==================================================================================

-- Wholesaler + All Other Sectors (SR 46) -> SN001, SN007
INSERT INTO public.business_activity_scenarios (business_activity_type_id, sector_id, scenario_id)
SELECT 
    bat.id as business_activity_type_id,
    s.id as sector_id,
    sc.id as scenario_id
FROM public.business_activity_types bat
JOIN public.sectors s ON s.name = 'All Other Sectors'
JOIN public.scenario sc ON sc.code IN ('SN001', 'SN007')
WHERE bat.name = 'Wholesaler'
ON CONFLICT (business_activity_type_id, sector_id, scenario_id) DO NOTHING;

-- ==================================================================================
-- EXPORTER BUSINESS ACTIVITY SCENARIOS
-- ==================================================================================

-- Exporter + All Other Sectors (SR 61) -> SN002, SN001
INSERT INTO public.business_activity_scenarios (business_activity_type_id, sector_id, scenario_id)
SELECT 
    bat.id as business_activity_type_id,
    s.id as sector_id,
    sc.id as scenario_id
FROM public.business_activity_types bat
JOIN public.sectors s ON s.name = 'All Other Sectors'
JOIN public.scenario sc ON sc.code IN ('SN002', 'SN001')
WHERE bat.name = 'Exporter'
ON CONFLICT (business_activity_type_id, sector_id, scenario_id) DO NOTHING;

-- ==================================================================================
-- RETAILER BUSINESS ACTIVITY SCENARIOS
-- ==================================================================================

-- Retailer + All Other Sectors (SR 76) -> SN006, SN001
INSERT INTO public.business_activity_scenarios (business_activity_type_id, sector_id, scenario_id)
SELECT 
    bat.id as business_activity_type_id,
    s.id as sector_id,
    sc.id as scenario_id
FROM public.business_activity_types bat
JOIN public.sectors s ON s.name = 'All Other Sectors'
JOIN public.scenario sc ON sc.code IN ('SN006', 'SN001')
WHERE bat.name = 'Retailer'
ON CONFLICT (business_activity_type_id, sector_id, scenario_id) DO NOTHING;

-- Retailer + CNG Stations (SR 86) -> SN006
INSERT INTO public.business_activity_scenarios (business_activity_type_id, sector_id, scenario_id)
SELECT 
    bat.id as business_activity_type_id,
    s.id as sector_id,
    sc.id as scenario_id
FROM public.business_activity_types bat
JOIN public.sectors s ON s.name = 'CNG Stations'
JOIN public.scenario sc ON sc.code IN ('SN006')
WHERE bat.name = 'Retailer'
ON CONFLICT (business_activity_type_id, sector_id, scenario_id) DO NOTHING;

-- ==================================================================================
-- SERVICE PROVIDER BUSINESS ACTIVITY SCENARIOS
-- ==================================================================================

-- Service Provider + All Other Sectors (SR 91) -> SN005, SN010
INSERT INTO public.business_activity_scenarios (business_activity_type_id, sector_id, scenario_id)
SELECT 
    bat.id as business_activity_type_id,
    s.id as sector_id,
    sc.id as scenario_id
FROM public.business_activity_types bat
JOIN public.sectors s ON s.name = 'All Other Sectors'
JOIN public.scenario sc ON sc.code IN ('SN005', 'SN010')
WHERE bat.name = 'Service Provider'
ON CONFLICT (business_activity_type_id, sector_id, scenario_id) DO NOTHING;

-- Service Provider + Telecom (SR 95) -> SN005
INSERT INTO public.business_activity_scenarios (business_activity_type_id, sector_id, scenario_id)
SELECT 
    bat.id as business_activity_type_id,
    s.id as sector_id,
    sc.id as scenario_id
FROM public.business_activity_types bat
JOIN public.sectors s ON s.name = 'Telecom'
JOIN public.scenario sc ON sc.code IN ('SN005')
WHERE bat.name = 'Service Provider'
ON CONFLICT (business_activity_type_id, sector_id, scenario_id) DO NOTHING;

-- Service Provider + Electricity Distribution (SR 97) -> SN005
INSERT INTO public.business_activity_scenarios (business_activity_type_id, sector_id, scenario_id)
SELECT 
    bat.id as business_activity_type_id,
    s.id as sector_id,
    sc.id as scenario_id
FROM public.business_activity_types bat
JOIN public.sectors s ON s.name = 'Electricity Distribution'
JOIN public.scenario sc ON sc.code IN ('SN005')
WHERE bat.name = 'Service Provider'
ON CONFLICT (business_activity_type_id, sector_id, scenario_id) DO NOTHING;

-- Service Provider + Gas Distribution (SR 98) -> SN005
INSERT INTO public.business_activity_scenarios (business_activity_type_id, sector_id, scenario_id)
SELECT 
    bat.id as business_activity_type_id,
    s.id as sector_id,
    sc.id as scenario_id
FROM public.business_activity_types bat
JOIN public.sectors s ON s.name = 'Gas Distribution'
JOIN public.scenario sc ON sc.code IN ('SN005')
WHERE bat.name = 'Service Provider'
ON CONFLICT (business_activity_type_id, sector_id, scenario_id) DO NOTHING;

-- Service Provider + Services (SR 99) -> SN005, SN010
INSERT INTO public.business_activity_scenarios (business_activity_type_id, sector_id, scenario_id)
SELECT 
    bat.id as business_activity_type_id,
    s.id as sector_id,
    sc.id as scenario_id
FROM public.business_activity_types bat
JOIN public.sectors s ON s.name = 'Services'
JOIN public.scenario sc ON sc.code IN ('SN005', 'SN010')
WHERE bat.name = 'Service Provider'
ON CONFLICT (business_activity_type_id, sector_id, scenario_id) DO NOTHING;

-- ==================================================================================
-- OTHER BUSINESS ACTIVITY SCENARIOS
-- ==================================================================================

-- Other + All Other Sectors (SR 106) -> SN001, SN005, SN006
INSERT INTO public.business_activity_scenarios (business_activity_type_id, sector_id, scenario_id)
SELECT 
    bat.id as business_activity_type_id,
    s.id as sector_id,
    sc.id as scenario_id
FROM public.business_activity_types bat
JOIN public.sectors s ON s.name = 'All Other Sectors'
JOIN public.scenario sc ON sc.code IN ('SN001', 'SN005', 'SN006')
WHERE bat.name = 'Other'
ON CONFLICT (business_activity_type_id, sector_id, scenario_id) DO NOTHING;

-- ==================================================================================
-- CREATE INDEXES AND FINALIZE
-- ==================================================================================

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bas_business_activity_type_sector 
ON public.business_activity_scenarios(business_activity_type_id, sector_id);

CREATE INDEX IF NOT EXISTS idx_bas_scenario 
ON public.business_activity_scenarios(scenario_id);

CREATE INDEX IF NOT EXISTS idx_bas_lookup 
ON public.business_activity_scenarios(business_activity_type_id, sector_id, scenario_id);

-- Update table comment
COMMENT ON TABLE public.business_activity_scenarios IS 'FBR business activity scenarios mapped by business activity type and sector according to FBR API documentation';

-- Display migration results
DO $$
DECLARE
    total_mappings INTEGER;
    total_business_activities INTEGER;
    total_sectors INTEGER;
    total_scenarios INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_mappings FROM public.business_activity_scenarios;
    SELECT COUNT(*) INTO total_business_activities FROM public.business_activity_types;
    SELECT COUNT(*) INTO total_sectors FROM public.sectors;
    SELECT COUNT(*) INTO total_scenarios FROM public.scenario;
    
    RAISE NOTICE '=== FBR Business Activity Scenarios Migration Completed ===';
    RAISE NOTICE 'Total business activity scenarios created: %', total_mappings;
    RAISE NOTICE 'Total business activity types: %', total_business_activities;
    RAISE NOTICE 'Total sectors: %', total_sectors;
    RAISE NOTICE 'Total scenarios: %', total_scenarios;
    RAISE NOTICE 'Migration based on FBR API documentation patterns';
END $$;
