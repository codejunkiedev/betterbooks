-- Add phone_number to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone_number text; 