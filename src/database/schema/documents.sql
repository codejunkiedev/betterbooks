-- Create enum types for document status and type
CREATE TYPE document_status AS ENUM ('PENDING_REVIEW', 'IN_PROGRESS', 'COMPLETED');
CREATE TYPE document_type AS ENUM ('INVOICE', 'EXPENSE', 'BANK_STATEMENT');

-- Create the documents table
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  uploaded_by_user_id UUID NOT NULL REFERENCES auth.users(id),
  file_path TEXT NOT NULL, -- Path in Supabase Storage bucket
  original_filename TEXT NOT NULL,
  status document_status NOT NULL DEFAULT 'PENDING_REVIEW',
  type document_type NOT NULL, -- Differentiates invoices from bank statements etc.
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_documents_company_id ON documents(company_id);
CREATE INDEX idx_documents_uploaded_by_user_id ON documents(uploaded_by_user_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_type ON documents(type);
CREATE INDEX idx_documents_uploaded_at ON documents(uploaded_at);

-- Enable Row Level Security (RLS)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Define RLS Policies
CREATE POLICY "Users can view documents from their company"
    ON documents FOR SELECT
    USING (
        company_id IN (
            SELECT id FROM companies 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert documents for their company"
    ON documents FOR INSERT
    WITH CHECK (
        company_id IN (
            SELECT id FROM companies 
            WHERE user_id = auth.uid()
        ) AND
        uploaded_by_user_id = auth.uid()
    );

CREATE POLICY "Users can update documents from their company"
    ON documents FOR UPDATE
    USING (
        company_id IN (
            SELECT id FROM companies 
            WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        company_id IN (
            SELECT id FROM companies 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete documents from their company"
    ON documents FOR DELETE
    USING (
        company_id IN (
            SELECT id FROM companies 
            WHERE user_id = auth.uid()
        )
    ); 