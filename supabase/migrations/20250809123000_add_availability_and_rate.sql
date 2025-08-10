-- Add availability status and hourly rate to accountants
ALTER TABLE public.accountants
  ADD COLUMN IF NOT EXISTS availability_status text,
  ADD COLUMN IF NOT EXISTS hourly_rate numeric;

-- Optional: set default availability to 'Available' if null
UPDATE public.accountants SET availability_status = 'Available' WHERE availability_status IS NULL; 