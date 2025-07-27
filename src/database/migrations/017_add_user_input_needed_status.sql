-- Migration to add USER_INPUT_NEEDED status to document_status enum
-- This allows accountants to mark documents that need user input

-- Add the new status to the enum
ALTER TYPE document_status ADD VALUE 'USER_INPUT_NEEDED';

-- Add a comment to explain the new status
COMMENT ON TYPE document_status IS 'Document processing status: PENDING_REVIEW, IN_PROGRESS, COMPLETED, USER_INPUT_NEEDED'; 