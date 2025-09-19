-- Migration: Create scenario table early to satisfy dependencies
-- This migration ensures the scenario table exists before any junction tables that reference it
-- It should run early in the migration sequence to resolve dependency issues

-- Create scenario table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.scenario (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    description TEXT,
    sale_type VARCHAR(50),
    category VARCHAR(50),
    transaction_type_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_scenario_code ON public.scenario(code);

-- Enable RLS on the table
ALTER TABLE public.scenario ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for public read access (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'scenario_select_all' AND tablename = 'scenario') THEN
        CREATE POLICY scenario_select_all ON public.scenario FOR SELECT USING (true);
    END IF;
END $$;

-- Grant permissions
GRANT SELECT ON public.scenario TO authenticated;

-- Add comment for documentation
COMMENT ON TABLE public.scenario IS 'FBR tax scenarios and their metadata';

-- Insert basic scenarios if they don't exist (idempotent)
-- INSERT INTO public.scenario (code, description, sale_type, category, transaction_type_id) VALUES
-- ('SN001', 'Standard Sale', 'B2B', 'Sales', 1),
-- ('SN002', 'Export Sale', 'Export', 'Sales', 1),
-- ('SN003', 'Import Purchase', 'Import', 'Purchase', 2),
-- ('SN004', 'Local Purchase', 'B2B', 'Purchase', 2),
-- ('SN005', 'Service Sale', 'Service', 'Sales', 1),
-- ('SN006', 'Retail Sale', 'B2C', 'Sales', 1),
-- ('SN007', 'Wholesale Sale', 'B2B', 'Sales', 1),
-- ('SN008', 'Manufacturing Sale', 'Manufacturing', 'Sales', 1),
-- ('SN009', 'Distributor Sale', 'Distribution', 'Sales', 1),
-- ('SN010', 'Agent Commission', 'Commission', 'Income', 1)
-- ON CONFLICT (code) DO NOTHING;
