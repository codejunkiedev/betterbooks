-- Migration: Complete database setup
-- This migration ensures all database components are properly configured

-- Ensure all required tables exist with proper structure
-- Companies table
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type public.company_type NOT NULL,
    tax_id_number VARCHAR(50),
    filing_status public.filing_status,
    tax_year_end_month public.tax_year_end_month,
    tax_year_end_day INTEGER DEFAULT 31,
    assigned_accountant_id UUID,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FBR profiles table
CREATE TABLE IF NOT EXISTS public.fbr_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    cnic_ntn VARCHAR(20) NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    address TEXT,
    province_code INTEGER,
    mobile_number VARCHAR(20),
    business_activity_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- FBR API configs table
CREATE TABLE IF NOT EXISTS public.fbr_api_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sandbox_api_key TEXT,
    production_api_key TEXT,
    sandbox_status VARCHAR(50) DEFAULT 'not_configured',
    production_status VARCHAR(50) DEFAULT 'not_configured',
    last_sandbox_test TIMESTAMP WITH TIME ZONE,
    last_production_test TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- FBR scenario progress table
CREATE TABLE IF NOT EXISTS public.fbr_scenario_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    scenario_id VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'not_started',
    attempts INTEGER DEFAULT 0,
    last_attempt TIMESTAMP WITH TIME ZONE,
    completion_timestamp TIMESTAMP WITH TIME ZONE,
    fbr_response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, scenario_id)
);

-- Scenario table
CREATE TABLE IF NOT EXISTS public.scenario (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    description TEXT,
    sale_type VARCHAR(50),
    category VARCHAR(50),
    transaction_type_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business activity scenario junction table
CREATE TABLE IF NOT EXISTS public.business_activity_scenario (
    business_activity_id INTEGER NOT NULL REFERENCES public.business_activity(id) ON DELETE CASCADE,
    scenario_id INTEGER NOT NULL REFERENCES public.scenario(id) ON DELETE CASCADE,
    PRIMARY KEY (business_activity_id, scenario_id)
);

-- Business activity sector scenario junction table
CREATE TABLE IF NOT EXISTS public.business_activity_sector_scenario (
    business_activity_sector_combination_id INTEGER NOT NULL REFERENCES public.business_activity_sector_combinations(id) ON DELETE CASCADE,
    scenario_id INTEGER NOT NULL REFERENCES public.scenario(id) ON DELETE CASCADE,
    PRIMARY KEY (business_activity_sector_combination_id, scenario_id)
);

-- Province codes table
CREATE TABLE IF NOT EXISTS public.province_codes (
    id SERIAL PRIMARY KEY,
    state_province_code INTEGER UNIQUE NOT NULL,
    state_province_desc VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON public.companies(user_id);
CREATE INDEX IF NOT EXISTS idx_companies_assigned_accountant ON public.companies(assigned_accountant_id);
CREATE INDEX IF NOT EXISTS idx_fbr_profiles_user_id ON public.fbr_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_fbr_profiles_cnic_ntn ON public.fbr_profiles(cnic_ntn);
CREATE INDEX IF NOT EXISTS idx_fbr_api_configs_user_id ON public.fbr_api_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_fbr_scenario_progress_user_id ON public.fbr_scenario_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_fbr_scenario_progress_scenario_id ON public.fbr_scenario_progress(scenario_id);
CREATE INDEX IF NOT EXISTS idx_scenario_code ON public.scenario(code);
CREATE INDEX IF NOT EXISTS idx_business_activity_scenario_activity ON public.business_activity_scenario(business_activity_id);
CREATE INDEX IF NOT EXISTS idx_business_activity_scenario_scenario ON public.business_activity_scenario(scenario_id);
CREATE INDEX IF NOT EXISTS idx_business_activity_sector_scenario_combination ON public.business_activity_sector_scenario(business_activity_sector_combination_id);
CREATE INDEX IF NOT EXISTS idx_business_activity_sector_scenario_scenario ON public.business_activity_sector_scenario(scenario_id);
CREATE INDEX IF NOT EXISTS idx_province_codes_code ON public.province_codes(state_province_code);

-- Enable RLS on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fbr_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fbr_api_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fbr_scenario_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_activity_scenario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_activity_sector_scenario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.province_codes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for companies
CREATE POLICY companies_select_own ON public.companies
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY companies_insert_own ON public.companies
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY companies_update_own ON public.companies
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY companies_delete_own ON public.companies
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for fbr_profiles
CREATE POLICY fbr_profiles_select_own ON public.fbr_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY fbr_profiles_insert_own ON public.fbr_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY fbr_profiles_update_own ON public.fbr_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY fbr_profiles_delete_own ON public.fbr_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for fbr_api_configs
CREATE POLICY fbr_api_configs_select_own ON public.fbr_api_configs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY fbr_api_configs_insert_own ON public.fbr_api_configs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY fbr_api_configs_update_own ON public.fbr_api_configs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY fbr_api_configs_delete_own ON public.fbr_api_configs
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for fbr_scenario_progress
CREATE POLICY fbr_scenario_progress_select_own ON public.fbr_scenario_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY fbr_scenario_progress_insert_own ON public.fbr_scenario_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY fbr_scenario_progress_update_own ON public.fbr_scenario_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY fbr_scenario_progress_delete_own ON public.fbr_scenario_progress
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for public read access
CREATE POLICY scenario_select_all ON public.scenario FOR SELECT USING (true);
CREATE POLICY business_activity_scenario_select_all ON public.business_activity_scenario FOR SELECT USING (true);
CREATE POLICY business_activity_sector_scenario_select_all ON public.business_activity_sector_scenario FOR SELECT USING (true);
CREATE POLICY province_codes_select_all ON public.province_codes FOR SELECT USING (true);

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER companies_set_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER fbr_profiles_set_updated_at
    BEFORE UPDATE ON public.fbr_profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER fbr_api_configs_set_updated_at
    BEFORE UPDATE ON public.fbr_api_configs
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER fbr_scenario_progress_set_updated_at
    BEFORE UPDATE ON public.fbr_scenario_progress
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Insert sample province codes if they don't exist
INSERT INTO public.province_codes (state_province_code, state_province_desc) VALUES
(1, 'Punjab'),
(2, 'Sindh'),
(3, 'Khyber Pakhtunkhwa'),
(4, 'Balochistan'),
(5, 'Islamabad Capital Territory'),
(6, 'Azad Jammu and Kashmir'),
(7, 'Gilgit-Baltistan')
ON CONFLICT (state_province_code) DO NOTHING;

-- Insert sample scenarios if they don't exist
INSERT INTO public.scenario (code, description, sale_type, category, transaction_type_id) VALUES
('SN001', 'Standard Sale', 'B2B', 'Sales', 1),
('SN002', 'Export Sale', 'Export', 'Sales', 1),
('SN003', 'Import Purchase', 'Import', 'Purchase', 2),
('SN004', 'Local Purchase', 'B2B', 'Purchase', 2),
('SN005', 'Service Sale', 'Service', 'Sales', 1),
('SN006', 'Retail Sale', 'B2C', 'Sales', 1),
('SN007', 'Wholesale Sale', 'B2B', 'Sales', 1),
('SN008', 'Manufacturing Sale', 'Manufacturing', 'Sales', 1),
('SN009', 'Distributor Sale', 'Distribution', 'Sales', 1),
('SN010', 'Agent Commission', 'Commission', 'Income', 1)
ON CONFLICT (code) DO NOTHING;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.companies TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fbr_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fbr_api_configs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fbr_scenario_progress TO authenticated;
GRANT SELECT ON public.scenario TO authenticated;
GRANT SELECT ON public.business_activity_scenario TO authenticated;
GRANT SELECT ON public.business_activity_sector_scenario TO authenticated;
GRANT SELECT ON public.province_codes TO authenticated;

-- Add comments
COMMENT ON TABLE public.companies IS 'Company information for users';
COMMENT ON TABLE public.fbr_profiles IS 'FBR profile information for tax compliance';
COMMENT ON TABLE public.fbr_api_configs IS 'FBR API configuration and status';
COMMENT ON TABLE public.fbr_scenario_progress IS 'User progress on FBR scenarios';
COMMENT ON TABLE public.scenario IS 'FBR tax scenarios';
COMMENT ON TABLE public.business_activity_scenario IS 'Junction table for business activities and scenarios';
COMMENT ON TABLE public.business_activity_sector_scenario IS 'Junction table for business activity-sector combinations and scenarios';
COMMENT ON TABLE public.province_codes IS 'Province codes for Pakistan';
