-- Add comprehensive access policies for fbr_api_configs table
-- This allows full access for service role and authenticated users

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can manage FBR configs" ON fbr_api_configs;
DROP POLICY IF EXISTS "Authenticated users can manage FBR configs" ON fbr_api_configs;
DROP POLICY IF EXISTS "All access for FBR configs" ON fbr_api_configs;

-- Create policy for service role to manage all configs (for Edge Functions)
CREATE POLICY "Service role can manage FBR configs" ON fbr_api_configs
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Create policy for authenticated users to manage all configs
CREATE POLICY "Authenticated users can manage FBR configs" ON fbr_api_configs
    FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Create policy for all access (if needed for development/testing)
CREATE POLICY "All access for FBR configs" ON fbr_api_configs
    FOR ALL
    USING (true)
    WITH CHECK (true);
