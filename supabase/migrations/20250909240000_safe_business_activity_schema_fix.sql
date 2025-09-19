-- Migration: Safe business activity schema fix
-- This migration safely handles the case where columns may already exist
-- and ensures the schema is consistent

DO $$
DECLARE
    has_business_activity_id boolean;
    has_business_activity_type_id boolean;
    has_sector_id boolean;
BEGIN
    -- Check what columns exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_business_activities' 
        AND column_name = 'business_activity_id'
        AND table_schema = 'public'
    ) INTO has_business_activity_id;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_business_activities' 
        AND column_name = 'business_activity_type_id'
        AND table_schema = 'public'
    ) INTO has_business_activity_type_id;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_business_activities' 
        AND column_name = 'sector_id'
        AND table_schema = 'public'
    ) INTO has_sector_id;

    RAISE NOTICE 'Current column state: business_activity_id=%, business_activity_type_id=%, sector_id=%', 
        has_business_activity_id, has_business_activity_type_id, has_sector_id;

    -- If we have both columns, we need to migrate data and drop the old one
    IF has_business_activity_id AND has_business_activity_type_id THEN
        -- Check if business_activity_type_id has null values that need migration
        IF EXISTS (
            SELECT 1 FROM public.user_business_activities 
            WHERE business_activity_type_id IS NULL 
            AND business_activity_id IS NOT NULL
        ) THEN
            -- Try to map old business_activity_id to business_activity_type_id
            -- This is a best-effort migration based on typical mappings
            UPDATE public.user_business_activities 
            SET business_activity_type_id = CASE business_activity_id
                WHEN 1 THEN (SELECT id FROM public.business_activity_types WHERE name = 'Manufacturer' LIMIT 1)
                WHEN 2 THEN (SELECT id FROM public.business_activity_types WHERE name = 'Importer' LIMIT 1)
                WHEN 3 THEN (SELECT id FROM public.business_activity_types WHERE name = 'Distributor' LIMIT 1)
                WHEN 4 THEN (SELECT id FROM public.business_activity_types WHERE name = 'Wholesaler' LIMIT 1)
                WHEN 5 THEN (SELECT id FROM public.business_activity_types WHERE name = 'Exporter' LIMIT 1)
                WHEN 6 THEN (SELECT id FROM public.business_activity_types WHERE name = 'Retailer' LIMIT 1)
                WHEN 7 THEN (SELECT id FROM public.business_activity_types WHERE name = 'Service Provider' LIMIT 1)
                ELSE (SELECT id FROM public.business_activity_types WHERE name = 'Other' LIMIT 1)
            END
            WHERE business_activity_type_id IS NULL 
            AND business_activity_id IS NOT NULL;
            
            RAISE NOTICE 'Migrated data from business_activity_id to business_activity_type_id';
        END IF;

        -- Drop constraints related to business_activity_id
        BEGIN
            ALTER TABLE public.user_business_activities 
            DROP CONSTRAINT IF EXISTS user_business_activities_business_activity_id_fkey;
            RAISE NOTICE 'Dropped business_activity_id foreign key constraint';
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Could not drop business_activity_id foreign key constraint: %', SQLERRM;
        END;

        -- Drop old unique constraints
        BEGIN
            ALTER TABLE public.user_business_activities 
            DROP CONSTRAINT IF EXISTS user_business_activities_user_id_business_activity_id_key;
            RAISE NOTICE 'Dropped old unique constraint';
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Could not drop old unique constraint: %', SQLERRM;
        END;

        -- Drop the old column
        BEGIN
            ALTER TABLE public.user_business_activities DROP COLUMN IF EXISTS business_activity_id;
            RAISE NOTICE 'Dropped business_activity_id column';
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Could not drop business_activity_id column: %', SQLERRM;
        END;

    ELSIF has_business_activity_id AND NOT has_business_activity_type_id THEN
        -- Rename the column
        BEGIN
            ALTER TABLE public.user_business_activities 
            RENAME COLUMN business_activity_id TO business_activity_type_id;
            RAISE NOTICE 'Renamed business_activity_id to business_activity_type_id';
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Could not rename column: %', SQLERRM;
        END;
    END IF;

    -- Ensure sector_id column exists
    IF NOT has_sector_id THEN
        ALTER TABLE public.user_business_activities 
        ADD COLUMN sector_id INTEGER REFERENCES public.sectors(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added sector_id column';
    END IF;

    -- Ensure other required columns exist
    ALTER TABLE public.user_business_activities 
    ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false;
    
    ALTER TABLE public.user_business_activities 
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    
    ALTER TABLE public.user_business_activities 
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

    -- Set NOT NULL constraints
    UPDATE public.user_business_activities 
    SET is_primary = false WHERE is_primary IS NULL;
    
    UPDATE public.user_business_activities 
    SET created_at = NOW() WHERE created_at IS NULL;
    
    UPDATE public.user_business_activities 
    SET updated_at = NOW() WHERE updated_at IS NULL;

    -- Add proper constraints
    BEGIN
        ALTER TABLE public.user_business_activities 
        ADD CONSTRAINT user_business_activities_business_activity_type_id_fkey 
        FOREIGN KEY (business_activity_type_id) REFERENCES public.business_activity_types(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added business_activity_type_id foreign key constraint';
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'Foreign key constraint already exists';
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not add foreign key constraint: %', SQLERRM;
    END;

    BEGIN
        ALTER TABLE public.user_business_activities 
        ADD CONSTRAINT user_business_activities_sector_id_fkey 
        FOREIGN KEY (sector_id) REFERENCES public.sectors(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added sector_id foreign key constraint';
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'Sector foreign key constraint already exists';
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not add sector foreign key constraint: %', SQLERRM;
    END;

    -- Drop old indexes
    DROP INDEX IF EXISTS public.idx_user_business_activities_business_activity_id;
    
    -- Create new indexes
    CREATE INDEX IF NOT EXISTS idx_user_business_activities_business_activity_type_id 
    ON public.user_business_activities(business_activity_type_id);
    
    CREATE INDEX IF NOT EXISTS idx_user_business_activities_sector_id 
    ON public.user_business_activities(sector_id) WHERE sector_id IS NOT NULL;
    
    CREATE INDEX IF NOT EXISTS idx_user_business_activities_user_id 
    ON public.user_business_activities(user_id);

    RAISE NOTICE 'Business activity schema migration completed successfully';
END $$;
