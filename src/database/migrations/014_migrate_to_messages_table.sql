-- Migration to use messages table instead of document_comments
-- This migration will:
-- 1. Migrate existing document_comments data to messages table
-- 2. Add any missing columns and constraints
-- 3. Create appropriate indexes and policies

-- First, let's ensure the messages table has the right structure
-- Add any missing columns if they don't exist
DO $$ 
BEGIN
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'messages' AND column_name = 'updated_at') THEN
        ALTER TABLE messages ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
    END IF;
    
    -- Add content length constraint if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name = 'messages_content_length_check') THEN
        ALTER TABLE messages ADD CONSTRAINT messages_content_length_check 
        CHECK (length(content) > 0 AND length(content) <= 2000);
    END IF;
END $$;

-- Create indexes for better performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_messages_company_id ON messages(company_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_related_document_id ON messages(related_document_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_messages_updated_at ON messages;
CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_messages_updated_at();

-- Migrate existing document_comments data to messages table
-- We'll create messages for each comment, determining the recipient based on the document's company
INSERT INTO messages (
    company_id,
    sender_id,
    recipient_id,
    related_document_id,
    content,
    is_read,
    created_at,
    updated_at
)
SELECT 
    d.company_id,
    dc.author_id as sender_id,
    CASE 
        -- If author is the company owner, send to assigned accountant
        WHEN dc.author_id = c.user_id THEN COALESCE(c.assigned_accountant_id, c.user_id)
        -- If author is the assigned accountant, send to company owner
        WHEN dc.author_id = c.assigned_accountant_id THEN c.user_id
        -- Default fallback
        ELSE c.user_id
    END as recipient_id,
    dc.document_id as related_document_id,
    dc.content,
    true as is_read, -- Mark existing comments as read
    dc.created_at,
    COALESCE(dc.updated_at, dc.created_at) as updated_at
FROM document_comments dc
JOIN documents d ON dc.document_id = d.id
JOIN companies c ON d.company_id = c.id
WHERE NOT EXISTS (
    -- Avoid duplicates if migration is run multiple times
    SELECT 1 FROM messages m 
    WHERE m.related_document_id = dc.document_id 
    AND m.sender_id = dc.author_id 
    AND m.content = dc.content
    AND m.created_at = dc.created_at
);

-- Enable Row Level Security on messages table
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view messages for their company" ON messages;
DROP POLICY IF EXISTS "Users can insert messages for their company" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON messages;
DROP POLICY IF EXISTS "Accountants can view messages for assigned companies" ON messages;
DROP POLICY IF EXISTS "Accountants can insert messages for assigned companies" ON messages;
DROP POLICY IF EXISTS "Accountants can update their own messages" ON messages;
DROP POLICY IF EXISTS "Accountants can delete their own messages" ON messages;

-- Define RLS Policies for messages table
-- Users can view messages for their company
CREATE POLICY "Users can view messages for their company"
    ON messages FOR SELECT
    USING (
        company_id IN (
            SELECT id FROM companies 
            WHERE user_id = auth.uid()
        )
    );

-- Accountants can view messages for their assigned companies
CREATE POLICY "Accountants can view messages for assigned companies"
    ON messages FOR SELECT
    USING (
        company_id IN (
            SELECT c.id FROM companies c
            JOIN accountants a ON c.assigned_accountant_id = a.id
            WHERE a.user_id = auth.uid() AND a.is_active = true
        )
    );

-- Users can insert messages for their company
CREATE POLICY "Users can insert messages for their company"
    ON messages FOR INSERT
    WITH CHECK (
        sender_id = auth.uid() AND
        company_id IN (
            SELECT id FROM companies 
            WHERE user_id = auth.uid()
        )
    );

-- Accountants can insert messages for their assigned companies
CREATE POLICY "Accountants can insert messages for assigned companies"
    ON messages FOR INSERT
    WITH CHECK (
        sender_id = auth.uid() AND
        company_id IN (
            SELECT c.id FROM companies c
            JOIN accountants a ON c.assigned_accountant_id = a.id
            WHERE a.user_id = auth.uid() AND a.is_active = true
        )
    );

-- Users can update their own messages
CREATE POLICY "Users can update their own messages"
    ON messages FOR UPDATE
    USING (sender_id = auth.uid())
    WITH CHECK (sender_id = auth.uid());

-- Users can delete their own messages
CREATE POLICY "Users can delete their own messages"
    ON messages FOR DELETE
    USING (sender_id = auth.uid());

-- Mark migration as complete
-- Note: We're not dropping the document_comments table yet to allow for rollback
-- You can drop it manually after confirming the migration works correctly 