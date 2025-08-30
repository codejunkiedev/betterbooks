-- Fix buyers table with proper syntax and all access
-- This migration handles the buyers table creation and policies without syntax conflicts

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
        
        -- Create comprehensive all access policies
        DROP POLICY IF EXISTS buyers_all_access ON public.buyers;
        CREATE POLICY buyers_all_access ON public.buyers
            FOR ALL
            USING (true)
            WITH CHECK (true);
            
        RAISE NOTICE 'Created buyers table with all access';
    ELSE
        -- Table exists, just fix the foreign key constraint if needed
        ALTER TABLE public.buyers DROP CONSTRAINT IF EXISTS buyers_user_id_fkey;
        ALTER TABLE public.buyers 
        ADD CONSTRAINT buyers_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        
        -- Update policies to all access
        DROP POLICY IF EXISTS buyers_select_own ON public.buyers;
        DROP POLICY IF EXISTS buyers_insert_own ON public.buyers;
        DROP POLICY IF EXISTS buyers_update_own ON public.buyers;
        DROP POLICY IF EXISTS buyers_delete_own ON public.buyers;
        DROP POLICY IF EXISTS buyers_all_access ON public.buyers;
        
        CREATE POLICY buyers_all_access ON public.buyers
            FOR ALL
            USING (true)
            WITH CHECK (true);
        
        RAISE NOTICE 'Fixed buyers table with all access';
    END IF;
END $$;

-- Step 3: Create trigger function outside of DO block to avoid syntax conflicts
CREATE OR REPLACE FUNCTION update_buyers_updated_at()
RETURNS TRIGGER AS $func$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

-- Step 4: Create trigger if table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'buyers') THEN
        DROP TRIGGER IF EXISTS trigger_update_buyers_updated_at ON public.buyers;
        CREATE TRIGGER trigger_update_buyers_updated_at
            BEFORE UPDATE ON public.buyers
            FOR EACH ROW
            EXECUTE FUNCTION update_buyers_updated_at();
        RAISE NOTICE 'Created buyers trigger';
    END IF;
END $$;
