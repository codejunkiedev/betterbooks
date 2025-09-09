-- Migration: Create business_activity_scenario table early to satisfy dependencies
-- This migration ensures the business_activity_scenario table exists before any migrations that reference it
-- It should run early in the migration sequence to resolve dependency issues

-- Create business_activity table if it doesn't exist (needed for foreign key)
CREATE TABLE IF NOT EXISTS public.business_activity (
    id SERIAL PRIMARY KEY,
    sr INT UNIQUE NOT NULL,
    business_activity VARCHAR(100) NOT NULL,
    sector VARCHAR(200) NOT NULL
);

-- Create business_activity_scenario junction table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.business_activity_scenario (
    business_activity_id INT NOT NULL REFERENCES public.business_activity(id) ON DELETE CASCADE,
    scenario_id INT NOT NULL REFERENCES public.scenario(id) ON DELETE CASCADE,
    PRIMARY KEY (business_activity_id, scenario_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_business_activity_scenario_activity ON public.business_activity_scenario(business_activity_id);
CREATE INDEX IF NOT EXISTS idx_business_activity_scenario_scenario ON public.business_activity_scenario(scenario_id);

-- Enable RLS on the tables
ALTER TABLE public.business_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_activity_scenario ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access
CREATE POLICY business_activity_select_all ON public.business_activity FOR SELECT USING (true);
CREATE POLICY business_activity_scenario_select_all ON public.business_activity_scenario FOR SELECT USING (true);

-- Grant permissions
GRANT SELECT ON public.business_activity TO authenticated;
GRANT SELECT ON public.business_activity_scenario TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE public.business_activity IS 'Business activities with their sectors (legacy table)';
COMMENT ON TABLE public.business_activity_scenario IS 'Junction table for business activities and scenarios';

-- Insert sample business activities if they don't exist (idempotent)
INSERT INTO public.business_activity (sr, business_activity, sector) VALUES
(1, 'Manufacturer', 'Steel'),
(2, 'Manufacturer', 'FMCG'),
(3, 'Importer', 'Steel'),
(4, 'Importer', 'FMCG'),
(5, 'Exporter', 'Steel'),
(6, 'Exporter', 'FMCG'),
(7, 'Wholesale / Retails', 'Steel'),
(8, 'Wholesale / Retails', 'FMCG')
ON CONFLICT (sr) DO NOTHING;

-- Insert sample business activity scenario relationships if they don't exist (idempotent)
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id) VALUES
(1, 1), -- Manufacturer Steel -> Standard Sale
(1, 2), -- Manufacturer Steel -> Export Sale
(2, 1), -- Manufacturer FMCG -> Standard Sale
(2, 2), -- Manufacturer FMCG -> Export Sale
(3, 3), -- Importer Steel -> Import Purchase
(3, 4), -- Importer Steel -> Local Purchase
(4, 3), -- Importer FMCG -> Import Purchase
(4, 4), -- Importer FMCG -> Local Purchase
(5, 2), -- Exporter Steel -> Export Sale
(6, 2), -- Exporter FMCG -> Export Sale
(7, 1), -- Wholesale/Retail Steel -> Standard Sale
(7, 6), -- Wholesale/Retail Steel -> Retail Sale
(8, 1), -- Wholesale/Retail FMCG -> Standard Sale
(8, 6)  -- Wholesale/Retail FMCG -> Retail Sale
ON CONFLICT (business_activity_id, scenario_id) DO NOTHING;
