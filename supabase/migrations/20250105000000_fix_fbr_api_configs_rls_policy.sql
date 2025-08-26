-- Fix RLS policies for fbr_api_configs table
-- This allows the service role to insert/update records for users

-- Enable RLS if not already enabled
ALTER TABLE fbr_api_configs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own FBR config" ON fbr_api_configs;
DROP POLICY IF EXISTS "Users can insert their own FBR config" ON fbr_api_configs;
DROP POLICY IF EXISTS "Users can update their own FBR config" ON fbr_api_configs;
DROP POLICY IF EXISTS "Service role can manage FBR configs" ON fbr_api_configs;

-- Create policy for users to view their own config
CREATE POLICY "Users can view their own FBR config" ON fbr_api_configs
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create policy for users to insert their own config
CREATE POLICY "Users can insert their own FBR config" ON fbr_api_configs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own config
CREATE POLICY "Users can update their own FBR config" ON fbr_api_configs
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create policy for service role to manage all configs (for Edge Functions)
CREATE POLICY "Service role can manage FBR configs" ON fbr_api_configs
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
