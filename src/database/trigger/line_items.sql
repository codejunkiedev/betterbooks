-- Trigger for updated_at
CREATE TRIGGER update_line_items_updated_at
    BEFORE UPDATE ON line_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 