import { supabase } from './index';
import type {
    InvoiceItemForm,
    InvoiceItemCalculated,
    InvoiceRunningTotals,
    HSCode,
    HSCodeSearchResult
} from '@/shared/types/invoice';

/**
 * Get invoice items by invoice ID
 */
export async function getInvoiceItems(invoiceId: number): Promise<InvoiceItemCalculated[]> {
    const { data, error } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('created_at', { ascending: true });

    if (error) {
        throw new Error(`Failed to fetch invoice items: ${error.message}`);
    }

    return data || [];
}

/**
 * Create a new invoice item
 */
export async function createInvoiceItem(item: Omit<InvoiceItemForm, 'id'> & { invoice_id: number }): Promise<InvoiceItemCalculated> {
    const { data, error } = await supabase
        .from('invoice_items')
        .insert([item])
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to create invoice item: ${error.message}`);
    }

    return data;
}

/**
 * Update an existing invoice item
 */
export async function updateInvoiceItem(id: string, updates: Partial<InvoiceItemForm>): Promise<InvoiceItemCalculated> {
    const { data, error } = await supabase
        .from('invoice_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to update invoice item: ${error.message}`);
    }

    return data;
}

/**
 * Delete an invoice item
 */
export async function deleteInvoiceItem(id: string): Promise<void> {
    const { error } = await supabase
        .from('invoice_items')
        .delete()
        .eq('id', id);

    if (error) {
        throw new Error(`Failed to delete invoice item: ${error.message}`);
    }
}

/**
 * Get running totals for an invoice
 */
export async function getInvoiceRunningTotals(invoiceId: number): Promise<InvoiceRunningTotals> {
    const { data, error } = await supabase
        .from('invoice_items')
        .select('quantity, value_sales_excluding_st, sales_tax, total_amount')
        .eq('invoice_id', invoiceId);

    if (error) {
        throw new Error(`Failed to fetch running totals: ${error.message}`);
    }

    const totals = data?.reduce((acc, item) => ({
        total_quantity: acc.total_quantity + (item.quantity || 0),
        total_value_excluding_tax: acc.total_value_excluding_tax + (item.value_sales_excluding_st || 0),
        total_sales_tax: acc.total_sales_tax + (item.sales_tax || 0),
        total_amount: acc.total_amount + (item.total_amount || 0),
        total_items: acc.total_items + 1
    }), {
        total_quantity: 0,
        total_value_excluding_tax: 0,
        total_sales_tax: 0,
        total_amount: 0,
        total_items: 0
    });

    return totals;
}

/**
 * Search HS codes from cache
 */
export async function searchHSCodes(searchTerm: string): Promise<HSCodeSearchResult[]> {
    const { data, error } = await supabase
        .from('hs_codes_cache')
        .select('hs_code, description')
        .or(`hs_code.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .limit(50)
        .order('hs_code');

    if (error) {
        throw new Error(`Failed to search HS codes: ${error.message}`);
    }

    return data || [];
}

/**
 * Get HS code details from cache
 */
export async function getHSCodeDetails(hsCode: string): Promise<HSCode | null> {
    const { data, error } = await supabase
        .from('hs_codes_cache')
        .select('*')
        .eq('hs_code', hsCode)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null; // Not found
        }
        throw new Error(`Failed to fetch HS code details: ${error.message}`);
    }

    return data;
}

/**
 * Cache HS code data
 */
export async function cacheHSCode(hsCode: HSCode): Promise<void> {
    const { error } = await supabase
        .from('hs_codes_cache')
        .upsert([hsCode], { onConflict: 'hs_code' });

    if (error) {
        throw new Error(`Failed to cache HS code: ${error.message}`);
    }
}

/**
 * Bulk cache HS codes
 */
export async function bulkCacheHSCodes(hsCodes: HSCode[]): Promise<void> {
    if (hsCodes.length === 0) return;

    const { error } = await supabase
        .from('hs_codes_cache')
        .upsert(hsCodes, { onConflict: 'hs_code' });

    if (error) {
        throw new Error(`Failed to bulk cache HS codes: ${error.message}`);
    }
}

/**
 * Get cached HS codes that need updating (older than 24 hours)
 */
export async function getStaleHSCodes(): Promise<string[]> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
        .from('hs_codes_cache')
        .select('hs_code')
        .lt('last_updated', twentyFourHoursAgo);

    if (error) {
        throw new Error(`Failed to fetch stale HS codes: ${error.message}`);
    }

    return data?.map(item => item.hs_code) || [];
}