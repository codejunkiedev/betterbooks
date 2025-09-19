-- Migration: Add COMPANY_CREATED to activity_type enum
-- This migration adds the missing COMPANY_CREATED value to the activity_type enum

DO $$
BEGIN
  -- Check if enum exists
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_type') THEN
    -- Add COMPANY_CREATED if not present
    BEGIN
      ALTER TYPE public.activity_type ADD VALUE IF NOT EXISTS 'COMPANY_CREATED';
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
  END IF;
END$$;

-- Add comment
COMMENT ON TYPE public.activity_type IS 'Activity types for logging user and system actions - includes COMPANY_CREATED for onboarding';
