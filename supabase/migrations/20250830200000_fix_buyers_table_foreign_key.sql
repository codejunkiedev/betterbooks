-- Fix buyers table foreign key reference
-- Drop the existing foreign key constraint and recreate it with correct reference

-- First, drop the existing foreign key constraint if it exists
ALTER TABLE public.buyers DROP CONSTRAINT IF EXISTS buyers_user_id_fkey;

-- Add the correct foreign key constraint referencing auth.users
ALTER TABLE public.buyers 
ADD CONSTRAINT buyers_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
