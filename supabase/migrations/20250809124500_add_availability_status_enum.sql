-- Create enum type for availability status if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'availability_status') THEN
    CREATE TYPE public.availability_status AS ENUM ('Available', 'Busy', 'On Leave');
  END IF;
END$$;

-- Add the column with enum type if it does not exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'accountants'
      AND column_name = 'availability_status'
  ) THEN
    ALTER TABLE public.accountants
      ADD COLUMN availability_status public.availability_status;
  END IF;
END$$;

-- If the column exists but is text, convert it to the enum type (values must match enum labels)
DO $$
DECLARE
  col_type TEXT;
BEGIN
  SELECT data_type INTO col_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'accountants'
    AND column_name = 'availability_status';

  IF col_type = 'text' THEN
    ALTER TABLE public.accountants
      ALTER COLUMN availability_status TYPE public.availability_status
      USING CASE
        WHEN availability_status IN ('Available','Busy','On Leave') THEN availability_status::public.availability_status
        ELSE NULL
      END;
  END IF;
END$$; 