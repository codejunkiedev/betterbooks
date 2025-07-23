-- Migration to fix the messages updated_at trigger
-- This will prevent the trigger from firing when content hasn't actually changed

-- Drop the existing trigger
DROP TRIGGER IF EXISTS update_messages_updated_at ON messages;

-- Create a new function that only updates updated_at when content changes
CREATE OR REPLACE FUNCTION update_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update updated_at if content has actually changed
    IF OLD.content IS DISTINCT FROM NEW.content THEN
        NEW.updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create the new trigger
CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_messages_updated_at(); 