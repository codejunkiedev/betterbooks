-- Fix RLS policies for hs_codes_cache table
-- This migration creates the hs_codes_cache table and adds proper RLS policies

-- Create the hs_codes_cache table if it doesn't exist
CREATE TABLE IF NOT EXISTS "public"."hs_codes_cache" (
    "hs_code" text PRIMARY KEY,
    "description" text NOT NULL,
    "default_uom" text,
    "default_tax_rate" numeric,
    "is_third_schedule" boolean DEFAULT false,
    "last_updated" timestamptz DEFAULT now()
);

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can insert HS codes" ON "public"."hs_codes_cache";
DROP POLICY IF EXISTS "Users can read HS codes" ON "public"."hs_codes_cache";
DROP POLICY IF EXISTS "Users can update HS codes" ON "public"."hs_codes_cache";
DROP POLICY IF EXISTS "Users can delete HS codes" ON "public"."hs_codes_cache";

-- Enable RLS on the table
ALTER TABLE "public"."hs_codes_cache" ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read HS codes
CREATE POLICY "Users can read HS codes" ON "public"."hs_codes_cache"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert HS codes
CREATE POLICY "Users can insert HS codes" ON "public"."hs_codes_cache"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update HS codes
CREATE POLICY "Users can update HS codes" ON "public"."hs_codes_cache"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete HS codes (for cache management)
CREATE POLICY "Users can delete HS codes" ON "public"."hs_codes_cache"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (true);

-- Grant necessary permissions to authenticated role
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."hs_codes_cache" TO authenticated;

-- Create index on hs_code for better performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_hs_codes_cache_hs_code ON "public"."hs_codes_cache" (hs_code);
CREATE INDEX IF NOT EXISTS idx_hs_codes_cache_last_updated ON "public"."hs_codes_cache" (last_updated);
