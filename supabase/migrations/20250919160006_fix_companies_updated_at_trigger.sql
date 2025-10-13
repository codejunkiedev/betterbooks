-- Migration: Fix companies table updated_at trigger issue
-- The companies table doesn't have an updated_at column but has a trigger trying to set it

-- First, check if the companies table has an updated_at column
DO $$
BEGIN
    -- Check if updated_at column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'companies'
        AND column_name = 'updated_at'
        AND table_schema = 'public'
    ) THEN
        -- Add the updated_at column if it doesn't exist
        ALTER TABLE public.companies
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

        RAISE NOTICE 'Added updated_at column to companies table';
    ELSE
        RAISE NOTICE 'updated_at column already exists in companies table';
    END IF;
END $$;

-- Ensure the trigger function exists and is safe
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the NEW record has an updated_at field
    IF TG_TABLE_NAME = 'companies' THEN
        -- Only set updated_at if the column exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = TG_TABLE_NAME
            AND column_name = 'updated_at'
            AND table_schema = TG_TABLE_SCHEMA
        ) THEN
            NEW.updated_at = NOW();
        END IF;
    ELSE
        -- For other tables, assume they have updated_at
        NEW.updated_at = NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger to ensure it works with the updated function
DROP TRIGGER IF EXISTS companies_set_updated_at ON public.companies;

CREATE TRIGGER companies_set_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Add comment
COMMENT ON TRIGGER companies_set_updated_at ON public.companies IS 'Automatically updates the updated_at column when companies table is updated';