-- Create the document_comments table
CREATE TABLE public.document_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (length(content) > 0 AND length(content) <= 2000),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_document_comments_document_id ON document_comments(document_id);
CREATE INDEX idx_document_comments_author_id ON document_comments(author_id);
CREATE INDEX idx_document_comments_created_at ON document_comments(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE document_comments ENABLE ROW LEVEL SECURITY;

-- Define RLS Policies
-- Users can view comments for documents from their company
CREATE POLICY "Users can view comments for their company documents"
    ON document_comments FOR SELECT
    USING (
        document_id IN (
            SELECT d.id FROM documents d
            JOIN companies c ON d.company_id = c.id
            WHERE c.user_id = auth.uid()
        )
    );

-- Accountants can view comments for documents from their assigned companies
CREATE POLICY "Accountants can view comments for assigned company documents"
    ON document_comments FOR SELECT
    USING (
        document_id IN (
            SELECT d.id FROM documents d
            JOIN companies c ON d.company_id = c.id
            JOIN accountants a ON c.assigned_accountant_id = a.id
            WHERE a.user_id = auth.uid() AND a.is_active = true
        )
    );

-- Users can insert comments for documents from their company
CREATE POLICY "Users can insert comments for their company documents"
    ON document_comments FOR INSERT
    WITH CHECK (
        author_id = auth.uid() AND
        document_id IN (
            SELECT d.id FROM documents d
            JOIN companies c ON d.company_id = c.id
            WHERE c.user_id = auth.uid()
        )
    );

-- Accountants can insert comments for documents from their assigned companies
CREATE POLICY "Accountants can insert comments for assigned company documents"
    ON document_comments FOR INSERT
    WITH CHECK (
        author_id = auth.uid() AND
        document_id IN (
            SELECT d.id FROM documents d
            JOIN companies c ON d.company_id = c.id
            JOIN accountants a ON c.assigned_accountant_id = a.id
            WHERE a.user_id = auth.uid() AND a.is_active = true
        )
    );

-- Users can update their own comments for documents from their company
CREATE POLICY "Users can update their own comments for their company documents"
    ON document_comments FOR UPDATE
    USING (
        author_id = auth.uid() AND
        document_id IN (
            SELECT d.id FROM documents d
            JOIN companies c ON d.company_id = c.id
            WHERE c.user_id = auth.uid()
        )
    )
    WITH CHECK (
        author_id = auth.uid() AND
        document_id IN (
            SELECT d.id FROM documents d
            JOIN companies c ON d.company_id = c.id
            WHERE c.user_id = auth.uid()
        )
    );

-- Accountants can update their own comments for documents from their assigned companies
CREATE POLICY "Accountants can update their own comments for assigned company documents"
    ON document_comments FOR UPDATE
    USING (
        author_id = auth.uid() AND
        document_id IN (
            SELECT d.id FROM documents d
            JOIN companies c ON d.company_id = c.id
            JOIN accountants a ON c.assigned_accountant_id = a.id
            WHERE a.user_id = auth.uid() AND a.is_active = true
        )
    )
    WITH CHECK (
        author_id = auth.uid() AND
        document_id IN (
            SELECT d.id FROM documents d
            JOIN companies c ON d.company_id = c.id
            JOIN accountants a ON c.assigned_accountant_id = a.id
            WHERE a.user_id = auth.uid() AND a.is_active = true
        )
    );

-- Users can delete their own comments for documents from their company
CREATE POLICY "Users can delete their own comments for their company documents"
    ON document_comments FOR DELETE
    USING (
        author_id = auth.uid() AND
        document_id IN (
            SELECT d.id FROM documents d
            JOIN companies c ON d.company_id = c.id
            WHERE c.user_id = auth.uid()
        )
    );

-- Accountants can delete their own comments for documents from their assigned companies
CREATE POLICY "Accountants can delete their own comments for assigned company documents"
    ON document_comments FOR DELETE
    USING (
        author_id = auth.uid() AND
        document_id IN (
            SELECT d.id FROM documents d
            JOIN companies c ON d.company_id = c.id
            JOIN accountants a ON c.assigned_accountant_id = a.id
            WHERE a.user_id = auth.uid() AND a.is_active = true
        )
    );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_document_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_document_comments_updated_at
    BEFORE UPDATE ON document_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_document_comments_updated_at(); 