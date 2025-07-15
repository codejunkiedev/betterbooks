-- Create the admins table
CREATE TABLE public.admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    access_level TEXT NOT NULL DEFAULT 'admin',
    department TEXT,
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create unique index on user_id (one admin record per user)
CREATE UNIQUE INDEX idx_admins_user_id ON admins(user_id);

-- Create index on access_level
CREATE INDEX idx_admins_access_level ON admins(access_level);

-- Create the accountants table
CREATE TABLE public.accountants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    license_number TEXT,
    firm_name TEXT,
    specialization TEXT,
    years_of_experience INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create unique index on user_id (one accountant record per user)
CREATE UNIQUE INDEX idx_accountants_user_id ON accountants(user_id);

-- Create index on license_number
CREATE INDEX idx_accountants_license_number ON accountants(license_number);

-- Enable Row Level Security (RLS) for admins
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Define RLS Policies for admins
CREATE POLICY "Admins can view their own record"
    ON admins FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can update their own record"
    ON admins FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Super admins can view all admins"
    ON admins FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.user_id = auth.uid() 
            AND admins.access_level = 'super_admin'
            AND admins.is_active = true
        )
    );

CREATE POLICY "Super admins can insert admins"
    ON admins FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.user_id = auth.uid() 
            AND admins.access_level = 'super_admin'
            AND admins.is_active = true
        )
    );

CREATE POLICY "Super admins can update admins"
    ON admins FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.user_id = auth.uid() 
            AND admins.access_level = 'super_admin'
            AND admins.is_active = true
        )
    );

-- Enable Row Level Security (RLS) for accountants
ALTER TABLE accountants ENABLE ROW LEVEL SECURITY;

-- Define RLS Policies for accountants
CREATE POLICY "Accountants can view their own record"
    ON accountants FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Accountants can update their own record"
    ON accountants FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all accountants"
    ON accountants FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.user_id = auth.uid() 
            AND admins.is_active = true
        )
    );

CREATE POLICY "Admins can insert accountants"
    ON accountants FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.user_id = auth.uid() 
            AND admins.is_active = true
        )
    );

CREATE POLICY "Admins can update accountants"
    ON accountants FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.user_id = auth.uid() 
            AND admins.is_active = true
        )
    );

-- Create triggers to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_admins_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_admins_updated_at
    BEFORE UPDATE ON admins
    FOR EACH ROW
    EXECUTE FUNCTION update_admins_updated_at();

CREATE OR REPLACE FUNCTION update_accountants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_accountants_updated_at
    BEFORE UPDATE ON accountants
    FOR EACH ROW
    EXECUTE FUNCTION update_accountants_updated_at(); 