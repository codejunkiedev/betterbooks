-- Function to auto-update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new invoice creation
CREATE OR REPLACE FUNCTION public.handle_new_invoice()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the invoice status to processing
    UPDATE invoices
    SET status = 'processing'
    WHERE id = NEW.id
    AND user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new invoice creation
CREATE TRIGGER on_invoice_created
    AFTER INSERT ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_invoice(); 