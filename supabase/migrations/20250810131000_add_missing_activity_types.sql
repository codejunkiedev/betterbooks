-- Add missing activity_type enum values for logging
DO $$
BEGIN
  -- Ensure enum exists (created in earlier migrations)
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'activity_type'
  ) THEN
    -- If the enum does not exist in this environment, do nothing (created elsewhere)
    NULL;
  END IF;

  -- Add ACCOUNTANT_ASSIGNED if not present
  BEGIN
    ALTER TYPE public.activity_type ADD VALUE IF NOT EXISTS 'ACCOUNTANT_ASSIGNED';
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;

  -- Add USER_LOGOUT if not present
  BEGIN
    ALTER TYPE public.activity_type ADD VALUE IF NOT EXISTS 'USER_LOGOUT';
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
END$$; 