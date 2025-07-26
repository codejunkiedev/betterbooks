-- The activity_logs table and activity_type enum already exist in your database
-- This migration only adds the missing indexes and RLS policies

-- Create additional indexes for better performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_activity_logs_actor_id ON activity_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_activity ON activity_logs(activity);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Define RLS Policies
-- Users can view activity logs for their own companies
CREATE POLICY "Users can view activity logs for their companies"
    ON activity_logs FOR SELECT
    USING (
        company_id IN (
            SELECT id FROM companies 
            WHERE user_id = auth.uid()
        )
    );

-- Accountants can view activity logs for their assigned companies
CREATE POLICY "Accountants can view activity logs for assigned companies"
    ON activity_logs FOR SELECT
    USING (
        company_id IN (
            SELECT c.id FROM companies c
            JOIN accountants a ON c.assigned_accountant_id = a.id
            WHERE a.user_id = auth.uid() AND a.is_active = true
        )
    );

-- Admins can view all activity logs
CREATE POLICY "Admins can view all activity logs"
    ON activity_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Users can insert activity logs for their own companies
CREATE POLICY "Users can insert activity logs for their companies"
    ON activity_logs FOR INSERT
    WITH CHECK (
        company_id IN (
            SELECT id FROM companies 
            WHERE user_id = auth.uid()
        ) AND
        actor_id = auth.uid()
    );

-- Accountants can insert activity logs for their assigned companies
CREATE POLICY "Accountants can insert activity logs for assigned companies"
    ON activity_logs FOR INSERT
    WITH CHECK (
        company_id IN (
            SELECT c.id FROM companies c
            JOIN accountants a ON c.assigned_accountant_id = a.id
            WHERE a.user_id = auth.uid() AND a.is_active = true
        ) AND
        actor_id = auth.uid()
    );

-- Admins can insert activity logs for any company
CREATE POLICY "Admins can insert activity logs for any company"
    ON activity_logs FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE user_id = auth.uid() AND is_active = true
        ) AND
        actor_id = auth.uid()
    ); 