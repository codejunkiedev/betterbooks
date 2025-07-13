-- User Roles Schema
-- Defines the three user types: USER, ACCOUNTANT, ADMIN

-- Create user role enum
CREATE TYPE user_role AS ENUM (
    'USER',           -- Regular business owner/client
    'ACCOUNTANT',     -- Professional accountant
    'ADMIN'           -- Platform administrator
);

-- Create user roles table
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    assigned_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, role)
);

-- Create indexes for better performance
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);

-- Enable Row Level Security (RLS)
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Define RLS Policies
-- Users can view their own role
CREATE POLICY "Users can view their own role"
    ON user_roles FOR SELECT
    USING (auth.uid() = user_id);

-- Admins can view all roles
CREATE POLICY "Admins can view all roles"
    ON user_roles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'ADMIN'
        )
    );

-- Admins can insert roles
CREATE POLICY "Admins can insert roles"
    ON user_roles FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'ADMIN'
        )
    );

-- Admins can update roles
CREATE POLICY "Admins can update roles"
    ON user_roles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'ADMIN'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'ADMIN'
        )
    );

-- Admins can delete roles
CREATE POLICY "Admins can delete roles"
    ON user_roles FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'ADMIN'
        )
    );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON user_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_user_roles_updated_at();

-- Insert default admin role (you'll need to replace with actual admin user ID)
-- This should be done after creating the first admin user
-- INSERT INTO user_roles (user_id, role) VALUES ('admin-user-id-here', 'ADMIN'); 