-- Migration: Create missing tables and update profiles
-- This migration adds the missing tables referenced in the user stories

-- -----------------------------------------------------------------------------
-- 1. UPDATE PROFILES TABLE
-- Add role and status columns to profiles table
-- -----------------------------------------------------------------------------

-- Add role column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role public.user_role DEFAULT 'USER';

-- Add status column to profiles table  
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED'));

-- Add updated_at column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_profiles_updated_at();

-- -----------------------------------------------------------------------------
-- 2. CREATE MESSAGES TABLE
-- Stores conversations between users and accountants
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  related_document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_company_id ON public.messages(company_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Define RLS Policies for messages
CREATE POLICY "Users can view messages for their companies"
    ON public.messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.companies 
            WHERE companies.id = messages.company_id 
            AND (
                companies.user_id = auth.uid() OR 
                companies.assigned_accountant_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can send messages for their companies"
    ON public.messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.companies 
            WHERE companies.id = messages.company_id 
            AND (
                companies.user_id = auth.uid() OR 
                companies.assigned_accountant_id = auth.uid()
            )
        )
        AND sender_id = auth.uid()
    );

CREATE POLICY "Users can update their own messages"
    ON public.messages FOR UPDATE
    USING (sender_id = auth.uid())
    WITH CHECK (sender_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 3. CREATE ACTIVITY LOGS TABLE
-- The audit trail for all significant actions on the platform
-- -----------------------------------------------------------------------------

-- Create activity_type enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE public.activity_type AS ENUM (
        'USER_LOGIN',
        'USER_LOGOUT',
        'DOCUMENT_UPLOADED',
        'DOCUMENT_DELETED',
        'DOCUMENT_STATUS_CHANGED',
        'JOURNAL_ENTRY_CREATED',
        'JOURNAL_ENTRY_UPDATED',
        'JOURNAL_ENTRY_DELETED',
        'COMPANY_CREATED',
        'COMPANY_UPDATED',
        'COMPANY_ACTIVATED',
        'COMPANY_DEACTIVATED',
        'USER_CREATED',
        'USER_UPDATED',
        'USER_DEACTIVATED',
        'USER_ACTIVATED',
        'ACCOUNTANT_ASSIGNED',
        'ACCOUNTANT_UNASSIGNED',
        'REPORT_GENERATED',
        'PASSWORD_RESET_REQUESTED',
        'PASSWORD_CHANGED',
        'PROFILE_UPDATED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.activity_logs (
    id BIGSERIAL PRIMARY KEY,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    activity public.activity_type NOT NULL,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_company_id ON public.activity_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_actor_id ON public.activity_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_activity ON public.activity_logs(activity);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Define RLS Policies for activity logs
CREATE POLICY "Users can view activity logs for their companies"
    ON public.activity_logs FOR SELECT
    USING (
        company_id IS NULL OR
        EXISTS (
            SELECT 1 FROM public.companies 
            WHERE companies.id = activity_logs.company_id 
            AND (
                companies.user_id = auth.uid() OR 
                companies.assigned_accountant_id = auth.uid()
            )
        )
    );

CREATE POLICY "System can insert activity logs"
    ON public.activity_logs FOR INSERT
    WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- 4. CREATE TAX INFORMATION TABLE
-- Store tax-related information for companies
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.tax_information (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    tax_id_number TEXT,
    filing_status TEXT CHECK (filing_status IN ('SOLE_PROPRIETOR', 'LLC', 'S_CORP', 'C_CORP', 'PARTNERSHIP')),
    tax_year_end DATE,
    ein TEXT,
    ssn TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tax_information_company_id ON public.tax_information(company_id);

-- Enable RLS
ALTER TABLE public.tax_information ENABLE ROW LEVEL SECURITY;

-- Define RLS Policies
CREATE POLICY "Users can view their own tax information"
    ON public.tax_information FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.companies 
            WHERE companies.id = tax_information.company_id 
            AND companies.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own tax information"
    ON public.tax_information FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.companies 
            WHERE companies.id = tax_information.company_id 
            AND companies.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.companies 
            WHERE companies.id = tax_information.company_id 
            AND companies.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own tax information"
    ON public.tax_information FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.companies 
            WHERE companies.id = tax_information.company_id 
            AND companies.user_id = auth.uid()
        )
    );

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_tax_information_updated_at
    BEFORE UPDATE ON public.tax_information
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- 5. CREATE TAX DOCUMENTS TABLE
-- Store tax documents uploaded by accountants
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.tax_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    uploaded_by_accountant_id UUID NOT NULL REFERENCES public.accountants(id),
    file_path TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    document_type TEXT NOT NULL CHECK (document_type IN ('TAX_RETURN', 'ESTIMATED_TAX_VOUCHER', 'SUMMARY_REPORT', 'OTHER')),
    tax_year INTEGER,
    uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tax_documents_company_id ON public.tax_documents(company_id);
CREATE INDEX IF NOT EXISTS idx_tax_documents_uploaded_by ON public.tax_documents(uploaded_by_accountant_id);
CREATE INDEX IF NOT EXISTS idx_tax_documents_tax_year ON public.tax_documents(tax_year);

-- Enable RLS
ALTER TABLE public.tax_documents ENABLE ROW LEVEL SECURITY;

-- Define RLS Policies
CREATE POLICY "Users can view their own tax documents"
    ON public.tax_documents FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.companies 
            WHERE companies.id = tax_documents.company_id 
            AND companies.user_id = auth.uid()
        )
    );

CREATE POLICY "Accountants can upload tax documents for assigned companies"
    ON public.tax_documents FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.companies 
            WHERE companies.id = tax_documents.company_id 
            AND companies.assigned_accountant_id = auth.uid()
        )
        AND uploaded_by_accountant_id = auth.uid()
    );

-- -----------------------------------------------------------------------------
-- 6. CREATE COMMENTS TABLE
-- Store comments on documents and bank statements
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    related_document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    related_tax_document_id UUID REFERENCES public.tax_documents(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_comments_company_id ON public.comments(company_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON public.comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_related_document_id ON public.comments(related_document_id);

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Define RLS Policies
CREATE POLICY "Users can view comments for their companies"
    ON public.comments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.companies 
            WHERE companies.id = comments.company_id 
            AND (
                companies.user_id = auth.uid() OR 
                companies.assigned_accountant_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can create comments for their companies"
    ON public.comments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.companies 
            WHERE companies.id = comments.company_id 
            AND (
                companies.user_id = auth.uid() OR 
                companies.assigned_accountant_id = auth.uid()
            )
        )
        AND author_id = auth.uid()
    );

CREATE POLICY "Users can update their own comments"
    ON public.comments FOR UPDATE
    USING (author_id = auth.uid())
    WITH CHECK (author_id = auth.uid());

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON public.comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- 7. CREATE OPENING BALANCES TABLE
-- Store opening balance information for companies
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.opening_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    cash_balance NUMERIC(12, 2) NOT NULL DEFAULT 0,
    balance_as_of_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_opening_balances_company_id ON public.opening_balances(company_id);

-- Enable RLS
ALTER TABLE public.opening_balances ENABLE ROW LEVEL SECURITY;

-- Define RLS Policies
CREATE POLICY "Users can view their own opening balances"
    ON public.opening_balances FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.companies 
            WHERE companies.id = opening_balances.company_id 
            AND companies.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own opening balances"
    ON public.opening_balances FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.companies 
            WHERE companies.id = opening_balances.company_id 
            AND companies.user_id = auth.uid()
        )
    );

-- -----------------------------------------------------------------------------
-- 8. ADD MISSING COLUMNS TO EXISTING TABLES
-- -----------------------------------------------------------------------------

-- Add missing columns to journal_entries table
ALTER TABLE public.journal_entries 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Add missing columns to documents table
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Create triggers for updated_at columns
CREATE TRIGGER update_journal_entries_updated_at
    BEFORE UPDATE ON public.journal_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON public.documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- 9. CREATE ADDITIONAL INDEXES FOR PERFORMANCE
-- -----------------------------------------------------------------------------

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_journal_entries_company_date ON public.journal_entries(company_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_accountant ON public.journal_entries(created_by_accountant_id);
CREATE INDEX IF NOT EXISTS idx_documents_company_status ON public.documents(company_id, status);
CREATE INDEX IF NOT EXISTS idx_documents_type ON public.documents(type);
CREATE INDEX IF NOT EXISTS idx_companies_accountant ON public.companies(assigned_accountant_id);
CREATE INDEX IF NOT EXISTS idx_companies_type ON public.companies(type);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status); 