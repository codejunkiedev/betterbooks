-- Create buyers table with proper dependencies
-- This migration ensures all required types and tables exist before creating the buyers table

-- Step 1: Ensure registration_type enum exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'registration_type') THEN
        CREATE TYPE public.registration_type AS ENUM ('Registered', 'Unregistered');
        RAISE NOTICE 'Created registration_type enum';
    END IF;
END $$;

-- Step 2: Create buyers table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'buyers') THEN
        -- Create the buyers table with correct foreign key reference
        CREATE TABLE public.buyers (
            id BIGSERIAL PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            ntn_cnic VARCHAR(13) NOT NULL,
            business_name VARCHAR(100) NOT NULL,
            province_code VARCHAR(10) NOT NULL,
            address TEXT NOT NULL,
            registration_type registration_type NOT NULL,
            is_walk_in BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Add constraints
        ALTER TABLE public.buyers
            ADD CONSTRAINT buyers_ntn_cnic_format_chk CHECK (ntn_cnic ~ '^[0-9]{7}$|^[0-9]{13}$');
        
        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_buyers_user_ntn ON public.buyers(user_id, ntn_cnic);
        CREATE INDEX IF NOT EXISTS idx_buyers_search ON public.buyers(business_name, ntn_cnic);
        CREATE INDEX IF NOT EXISTS idx_buyers_user_id ON public.buyers(user_id);
        
        -- Enable RLS
        ALTER TABLE public.buyers ENABLE ROW LEVEL SECURITY;
        
        -- Create RLS policies
        DROP POLICY IF EXISTS buyers_select_own ON public.buyers;
        CREATE POLICY buyers_select_own ON public.buyers
            FOR SELECT USING (auth.uid() IS NOT NULL AND user_id = auth.uid());
        
        DROP POLICY IF EXISTS buyers_insert_own ON public.buyers;
        CREATE POLICY buyers_insert_own ON public.buyers
            FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());
        
        DROP POLICY IF EXISTS buyers_update_own ON public.buyers;
        CREATE POLICY buyers_update_own ON public.buyers
            FOR UPDATE USING (auth.uid() IS NOT NULL AND user_id = auth.uid());
        
        DROP POLICY IF EXISTS buyers_delete_own ON public.buyers;
        CREATE POLICY buyers_delete_own ON public.buyers
            FOR DELETE USING (auth.uid() IS NOT NULL AND user_id = auth.uid());
        
        -- Create trigger function if it doesn't exist
        CREATE OR REPLACE FUNCTION update_buyers_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        
        -- Create trigger
        DROP TRIGGER IF EXISTS trigger_update_buyers_updated_at ON public.buyers;
        CREATE TRIGGER trigger_update_buyers_updated_at
            BEFORE UPDATE ON public.buyers
            FOR EACH ROW
            EXECUTE FUNCTION update_buyers_updated_at();
            
        RAISE NOTICE 'Created buyers table with correct foreign key reference';
    ELSE
        -- Table exists, just fix the foreign key constraint if needed
        ALTER TABLE public.buyers DROP CONSTRAINT IF EXISTS buyers_user_id_fkey;
        ALTER TABLE public.buyers 
        ADD CONSTRAINT buyers_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Fixed foreign key constraint on existing buyers table';
    END IF;
END $$;
