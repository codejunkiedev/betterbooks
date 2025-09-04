-- Fix all foreign key references from public.profiles to auth.users
-- This migration handles all tables that incorrectly reference public.profiles

-- Fix invoice_sequences table
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'invoice_sequences') THEN
        CREATE TABLE public.invoice_sequences (
            user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            year INTEGER NOT NULL,
            last_number INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            PRIMARY KEY (user_id, year)
        );
        
        CREATE INDEX IF NOT EXISTS idx_invoice_sequences_user_year ON public.invoice_sequences(user_id, year);
        ALTER TABLE public.invoice_sequences ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY invoice_sequences_select_own ON public.invoice_sequences
            FOR SELECT USING (auth.uid() IS NOT NULL AND user_id = auth.uid());
        CREATE POLICY invoice_sequences_insert_own ON public.invoice_sequences
            FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());
        CREATE POLICY invoice_sequences_update_own ON public.invoice_sequences
            FOR UPDATE USING (auth.uid() IS NOT NULL AND user_id = auth.uid());
        
        RAISE NOTICE 'Created invoice_sequences table';
    ELSE
        ALTER TABLE public.invoice_sequences DROP CONSTRAINT IF EXISTS invoice_sequences_user_id_fkey;
        ALTER TABLE public.invoice_sequences 
        ADD CONSTRAINT invoice_sequences_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Fixed invoice_sequences foreign key';
    END IF;
END $$;

-- Create function to get next invoice number
CREATE OR REPLACE FUNCTION get_next_invoice_number(user_uuid uuid, invoice_year integer)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    next_number integer;
    invoice_number text;
BEGIN
    INSERT INTO public.invoice_sequences (user_id, year, last_number)
    VALUES (user_uuid, invoice_year, 1)
    ON CONFLICT (user_id, year)
    DO UPDATE SET 
        last_number = public.invoice_sequences.last_number + 1,
        updated_at = NOW()
    RETURNING last_number INTO next_number;
    
    invoice_number := invoice_year::text || '-' || user_uuid::text || '-' || next_number::text;
    RETURN invoice_number;
END;
$$;

GRANT EXECUTE ON FUNCTION get_next_invoice_number(uuid, integer) TO authenticated;

-- Fix invoices table
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'invoices') THEN
        CREATE TABLE public.invoices (
            id BIGSERIAL PRIMARY KEY,
            user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            invoice_ref_no VARCHAR(100) NOT NULL,
            invoice_type VARCHAR(50) NOT NULL,
            invoice_date DATE NOT NULL,
            seller_ntn_cnic VARCHAR(13) NOT NULL,
            seller_business_name VARCHAR(100) NOT NULL,
            seller_province VARCHAR(50) NOT NULL,
            seller_address VARCHAR(250) NOT NULL,
            buyer_ntn_cnic VARCHAR(13) NOT NULL,
            buyer_business_name VARCHAR(100) NOT NULL,
            buyer_province VARCHAR(50) NOT NULL,
            buyer_address VARCHAR(250) NOT NULL,
            buyer_registration_type VARCHAR(50) NOT NULL,
            scenario_id VARCHAR(50),
            total_amount DECIMAL(12,2) NOT NULL CHECK (total_amount >= 0),
            notes TEXT,
            fbr_response JSONB,
            status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
        CREATE INDEX IF NOT EXISTS idx_invoices_invoice_ref_no ON public.invoices(invoice_ref_no);
        CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
        CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON public.invoices(created_at);
        
        ALTER TABLE public.invoices
            ADD CONSTRAINT invoices_user_ref_no_unique UNIQUE (user_id, invoice_ref_no);
        
        ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY invoices_select_own ON public.invoices
            FOR SELECT USING (auth.uid() IS NOT NULL AND user_id = auth.uid());
        CREATE POLICY invoices_insert_own ON public.invoices
            FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());
        CREATE POLICY invoices_update_own ON public.invoices
            FOR UPDATE USING (auth.uid() IS NOT NULL AND user_id = auth.uid());
        CREATE POLICY invoices_delete_own ON public.invoices
            FOR DELETE USING (auth.uid() IS NOT NULL AND user_id = auth.uid());
        
        RAISE NOTICE 'Created invoices table';
    ELSE
        ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_user_id_fkey;
        ALTER TABLE public.invoices 
        ADD CONSTRAINT invoices_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Fixed invoices foreign key';
    END IF;
END $$;

-- Create trigger function for invoices
CREATE OR REPLACE FUNCTION update_invoices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS trigger_update_invoices_updated_at ON public.invoices;
CREATE TRIGGER trigger_update_invoices_updated_at
    BEFORE UPDATE ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_invoices_updated_at();

-- Fix fbr_profiles table
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'fbr_profiles') THEN
        CREATE TABLE public.fbr_profiles (
            user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            cnic_ntn VARCHAR(13) NOT NULL,
            business_name VARCHAR(100) NOT NULL,
            province_code INTEGER NOT NULL,
            address TEXT NOT NULL,
            mobile_number VARCHAR(15) NOT NULL,
            business_activity_id INTEGER NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_fbr_profiles_cnic_ntn ON public.fbr_profiles(cnic_ntn);
        CREATE INDEX IF NOT EXISTS idx_fbr_profiles_business_activity ON public.fbr_profiles(business_activity_id);
        
        ALTER TABLE public.fbr_profiles ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY fbr_profiles_select_own ON public.fbr_profiles
            FOR SELECT USING (auth.uid() IS NOT NULL AND user_id = auth.uid());
        CREATE POLICY fbr_profiles_insert_own ON public.fbr_profiles
            FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());
        CREATE POLICY fbr_profiles_update_own ON public.fbr_profiles
            FOR UPDATE USING (auth.uid() IS NOT NULL AND user_id = auth.uid());
        CREATE POLICY fbr_profiles_delete_own ON public.fbr_profiles
            FOR DELETE USING (auth.uid() IS NOT NULL AND user_id = auth.uid());
            
        RAISE NOTICE 'Created fbr_profiles table';
    ELSE
        ALTER TABLE public.fbr_profiles DROP CONSTRAINT IF EXISTS fbr_profiles_user_id_fkey;
        ALTER TABLE public.fbr_profiles 
        ADD CONSTRAINT fbr_profiles_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Fixed fbr_profiles foreign key';
    END IF;
END $$;

-- Fix fbr_scenario_progress table
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'fbr_scenario_progress') THEN
        CREATE TABLE public.fbr_scenario_progress (
            id BIGSERIAL PRIMARY KEY,
            user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            scenario_id VARCHAR(10) NOT NULL,
            status VARCHAR(20) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'failed')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, scenario_id)
        );
        
        CREATE INDEX IF NOT EXISTS idx_fbr_scenario_progress_user_id ON public.fbr_scenario_progress(user_id);
        CREATE INDEX IF NOT EXISTS idx_fbr_scenario_progress_scenario_id ON public.fbr_scenario_progress(scenario_id);
        
        ALTER TABLE public.fbr_scenario_progress ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY fbr_scenario_progress_select_own ON public.fbr_scenario_progress
            FOR SELECT USING (auth.uid() IS NOT NULL AND user_id = auth.uid());
        CREATE POLICY fbr_scenario_progress_insert_own ON public.fbr_scenario_progress
            FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());
        CREATE POLICY fbr_scenario_progress_update_own ON public.fbr_scenario_progress
            FOR UPDATE USING (auth.uid() IS NOT NULL AND user_id = auth.uid());
        CREATE POLICY fbr_scenario_progress_delete_own ON public.fbr_scenario_progress
            FOR DELETE USING (auth.uid() IS NOT NULL AND user_id = auth.uid());
            
        RAISE NOTICE 'Created fbr_scenario_progress table';
    ELSE
        ALTER TABLE public.fbr_scenario_progress DROP CONSTRAINT IF EXISTS fbr_scenario_progress_user_id_fkey;
        ALTER TABLE public.fbr_scenario_progress 
        ADD CONSTRAINT fbr_scenario_progress_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Fixed fbr_scenario_progress foreign key';
    END IF;
END $$;

-- Fix fbr_api_configs table
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'fbr_api_configs') THEN
        CREATE TABLE public.fbr_api_configs (
            id BIGSERIAL PRIMARY KEY,
            user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            api_key VARCHAR(255) NOT NULL,
            api_secret VARCHAR(255) NOT NULL,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_fbr_api_configs_user_id ON public.fbr_api_configs(user_id);
        
        ALTER TABLE public.fbr_api_configs ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY fbr_api_configs_select_own ON public.fbr_api_configs
            FOR SELECT USING (auth.uid() IS NOT NULL AND user_id = auth.uid());
        CREATE POLICY fbr_api_configs_insert_own ON public.fbr_api_configs
            FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());
        CREATE POLICY fbr_api_configs_update_own ON public.fbr_api_configs
            FOR UPDATE USING (auth.uid() IS NOT NULL AND user_id = auth.uid());
        CREATE POLICY fbr_api_configs_delete_own ON public.fbr_api_configs
            FOR DELETE USING (auth.uid() IS NOT NULL AND user_id = auth.uid());
            
        RAISE NOTICE 'Created fbr_api_configs table';
    ELSE
        ALTER TABLE public.fbr_api_configs DROP CONSTRAINT IF EXISTS fbr_api_configs_user_id_fkey;
        ALTER TABLE public.fbr_api_configs 
        ADD CONSTRAINT fbr_api_configs_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Fixed fbr_api_configs foreign key';
    END IF;
END $$;
