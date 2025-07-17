-- Modify journal_entries table to allow user-created entries
-- Make created_by_accountant_id nullable and add created_by_user_id
ALTER TABLE journal_entries 
ADD COLUMN created_by_user_id uuid REFERENCES auth.users(id),
ALTER COLUMN created_by_accountant_id DROP NOT NULL;

-- Add constraint to ensure either accountant or user is specified
ALTER TABLE journal_entries 
ADD CONSTRAINT check_creator 
CHECK (
  (created_by_accountant_id IS NOT NULL AND created_by_user_id IS NULL) OR
  (created_by_accountant_id IS NULL AND created_by_user_id IS NOT NULL)
);

-- Add index for user-created entries
CREATE INDEX idx_journal_entries_created_by_user_id ON journal_entries(created_by_user_id);

-- Add RLS policies for user-created entries
CREATE POLICY "Users can view their own journal entries"
    ON journal_entries FOR SELECT
    USING (
        auth.uid() = created_by_user_id OR 
        auth.uid() IN (
            SELECT user_id FROM accountants WHERE id = created_by_accountant_id
        )
    );

CREATE POLICY "Users can insert their own journal entries"
    ON journal_entries FOR INSERT
    WITH CHECK (auth.uid() = created_by_user_id);

CREATE POLICY "Users can update their own journal entries"
    ON journal_entries FOR UPDATE
    USING (auth.uid() = created_by_user_id)
    WITH CHECK (auth.uid() = created_by_user_id);

CREATE POLICY "Users can delete their own journal entries"
    ON journal_entries FOR DELETE
    USING (auth.uid() = created_by_user_id); 