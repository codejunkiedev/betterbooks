-- Extend activity_type enum for logging accountant creation
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_type') THEN
    -- enum exists in prior migrations; nothing to do here
    NULL;
  END IF;
  -- Add value if not exists (safe-guard pattern)
  BEGIN
    ALTER TYPE public.activity_type ADD VALUE IF NOT EXISTS 'ACCOUNTANT_CREATED';
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
END$$;

-- Add additional fields to accountants table
ALTER TABLE public.accountants
  ADD COLUMN IF NOT EXISTS phone_number text,
  ADD COLUMN IF NOT EXISTS professional_qualifications text,
  ADD COLUMN IF NOT EXISTS specialization text[],
  ADD COLUMN IF NOT EXISTS employment_type text,
  ADD COLUMN IF NOT EXISTS max_client_capacity integer,
  ADD COLUMN IF NOT EXISTS start_date date,
  ADD COLUMN IF NOT EXISTS accountant_code text;

-- Ensure accountant_code is unique
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'accountants_accountant_code_key'
  ) THEN
    ALTER TABLE public.accountants
      ADD CONSTRAINT accountants_accountant_code_key UNIQUE (accountant_code);
  END IF;
END$$; 