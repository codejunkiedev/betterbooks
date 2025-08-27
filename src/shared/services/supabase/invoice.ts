import { supabase } from './client';
import { ScenarioInvoiceFormData, HSCode, HSCodeSearchResult, UoMValidationCache, InvoiceStatus } from '@/shared/types/invoice';
import { INVOICE_STATUS } from '@/shared/constants/invoice';

export interface InvoiceSequence {
    user_id: string;
    year: number;
    last_number: number;
    created_at: string;
    updated_at: string;
}

/**
 * Generate next invoice number for a user in a specific year
 */
export async function generateInvoiceNumber(userId: string, year: number): Promise<string> {
    try {
        const { data, error } = await supabase.rpc('get_next_invoice_number', {
            user_uuid: userId,
            invoice_year: year
        });

        if (error) {
            console.error('Error generating invoice number:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Failed to generate invoice number:', error);
        throw new Error('Failed to generate invoice number');
    }
}

/**
 * Save invoice to database
 */
export async function saveInvoice(
    userId: string,
    invoiceData: ScenarioInvoiceFormData,
    fbrResponse?: Record<string, unknown>
): Promise<{ success: boolean; invoiceId?: string; error?: string }> {
    try {
        // Generate invoice number if not provided
        if (!invoiceData.invoiceRefNo) {
            const year = new Date(invoiceData.invoiceDate).getFullYear();
            invoiceData.invoiceRefNo = await generateInvoiceNumber(userId, year);
        }

        // Save invoice data to database
        const { data, error } = await supabase
            .from('invoices')
            .insert({
                user_id: userId,
                invoice_ref_no: invoiceData.invoiceRefNo,
                invoice_type: invoiceData.invoiceType,
                invoice_date: invoiceData.invoiceDate,
                seller_ntn_cnic: invoiceData.sellerNTNCNIC,
                seller_business_name: invoiceData.sellerBusinessName,
                seller_province: invoiceData.sellerProvince,
                seller_address: invoiceData.sellerAddress,
                buyer_ntn_cnic: invoiceData.buyerNTNCNIC,
                buyer_business_name: invoiceData.buyerBusinessName,
                buyer_province: invoiceData.buyerProvince,
                buyer_address: invoiceData.buyerAddress,
                buyer_registration_type: invoiceData.buyerRegistrationType,
                scenario_id: invoiceData.scenarioId,
                total_amount: invoiceData.totalAmount,
                notes: invoiceData.notes,
                fbr_response: fbrResponse ? JSON.stringify(fbrResponse) : null,
                status: fbrResponse ? INVOICE_STATUS.SUBMITTED : INVOICE_STATUS.DRAFT
            })
            .select('id')
            .single();

        if (error) {
            console.error('Error saving invoice:', error);
            throw error;
        }

        // Save invoice items
        if (invoiceData.items.length > 0) {
            const itemsToInsert = invoiceData.items.map(item => ({
                invoice_id: data.id,
                hs_code: item.hs_code,
                item_name: item.item_name,
                quantity: item.quantity,
                unit_price: item.unit_price,
                total_amount: item.total_amount,
                sales_tax: item.sales_tax || 0,
                uom_code: item.uom_code,
                tax_rate: item.tax_rate,
                value_sales_excluding_st: item.value_sales_excluding_st,
                fixed_notified_value: item.fixed_notified_value,
                retail_price: item.retail_price,
                invoice_note: item.invoice_note,
                is_third_schedule: item.is_third_schedule
            }));

            const { error: itemsError } = await supabase
                .from('invoice_items')
                .insert(itemsToInsert);

            if (itemsError) {
                console.error('Error saving invoice items:', itemsError);
                throw itemsError;
            }
        }

        return { success: true, invoiceId: data.id };
    } catch (error) {
        console.error('Failed to save invoice:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}

/**
 * Get invoice by ID
 */
export async function getInvoiceById(invoiceId: string): Promise<{ data: Record<string, unknown> | null; error: unknown }> {
    try {
        const { data, error } = await supabase
            .from('invoices')
            .select(`
                *,
                invoice_items (*)
            `)
            .eq('id', invoiceId)
            .single();

        return { data, error };
    } catch (error) {
        console.error('Failed to get invoice:', error);
        return { data: null, error };
    }
}

/**
 * Get user's invoices
 */
export async function getUserInvoices(userId: string): Promise<{ data: Record<string, unknown>[]; error: unknown }> {
    try {
        const { data, error } = await supabase
            .from('invoices')
            .select(`
                *,
                invoice_items (*)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        return { data: data || [], error };
    } catch (error) {
        console.error('Failed to get user invoices:', error);
        return { data: [], error };
    }
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

/**
 * Get cached UoM validation for HS code
 */
export async function getCachedUoMValidation(hsCode: string): Promise<UoMValidationCache | null> {
    const { data, error } = await supabase
        .from('uom_validations')
        .select('*')
        .eq('hs_code', hsCode)
        .gt('expires_at', new Date().toISOString())
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null; // Not found or expired
        }
        throw new Error(`Failed to fetch UoM validation: ${error.message}`);
    }

    return data;
}

/**
 * Cache UoM validation result
 */
export async function cacheUoMValidation(
    hsCode: string,
    validUoMs: string[],
    recommendedUoM: string
): Promise<void> {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours from now

    const { error } = await supabase
        .from('uom_validations')
        .upsert([{
            hs_code: hsCode,
            valid_uoms: validUoMs,
            recommended_uom: recommendedUoM,
            expires_at: expiresAt
        }], { onConflict: 'hs_code' });

    if (error) {
        throw new Error(`Failed to cache UoM validation: ${error.message}`);
    }
}

/**
 * Clean up expired UoM validations
 */
export async function cleanupExpiredUoMValidations(): Promise<void> {
    const { error } = await supabase
        .from('uom_validations')
        .delete()
        .lt('expires_at', new Date().toISOString());

    if (error) {
        throw new Error(`Failed to cleanup expired UoM validations: ${error.message}`);
    }
}

/**
 * Fetch invoices with pagination
 */
export async function fetchInvoices(
    page: number = 1,
    pageSize: number = 10
): Promise<{ data: { items: Record<string, unknown>[]; total: number } | null; error: unknown }> {
    try {
        const offset = (page - 1) * pageSize;

        // Get total count
        const { count, error: countError } = await supabase
            .from('invoices')
            .select('*', { count: 'exact', head: true });

        if (countError) {
            throw countError;
        }

        // Get paginated data
        const { data, error } = await supabase
            .from('invoices')
            .select(`
                *,
                invoice_items (*)
            `)
            .range(offset, offset + pageSize - 1)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return {
            data: {
                items: data || [],
                total: count || 0
            },
            error: null
        };
    } catch (error) {
        console.error('Error fetching invoices:', error);
        return { data: null, error };
    }
}

export type InvoiceSortField =
    | 'invoice_ref_no'
    | 'invoice_date'
    | 'buyer_business_name'
    | 'total_amount'
    | 'status'
    | 'created_at';

export interface InvoiceFilters {
    status?: 'all' | 'draft' | 'submitted' | 'failed' | 'cancelled' | undefined;
    date_from?: string | undefined;
    date_to?: string | undefined;
    buyer?: string | undefined; // exact id or name substring
    amount_min?: number | undefined;
    amount_max?: number | undefined;
    search?: string | undefined; // invoice number or buyer name
    sort_by?: InvoiceSortField | undefined;
    sort_dir?: 'asc' | 'desc' | undefined;
}

/**
 * Fetch invoices for the current user with filtering, sorting, and pagination
 * Defaults to 25 items per page and created_at desc
 */
export async function getPaginatedInvoices(
    page: number = 1,
    pageSize: number = 25,
    filters: InvoiceFilters = {}
): Promise<{ data: { items: Record<string, unknown>[]; total: number } | null; error: Error | null }> {
    try {
        const { data: userData, error: userErr } = await supabase.auth.getUser();
        if (userErr || !userData?.user?.id) {
            throw new Error('User not authenticated');
        }

        const userId = userData.user.id;
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        let query = supabase
            .from('invoices')
            .select(
                `id, invoice_ref_no, invoice_date, buyer_business_name, total_amount, status, created_at`,
                { count: 'exact' }
            )
            .eq('user_id', userId);

        // Status filter
        if (filters.status && filters.status !== 'all') {
            query = query.eq('status', filters.status);
        }

        // Date range
        if (filters.date_from) {
            query = query.gte('invoice_date', filters.date_from);
        }
        if (filters.date_to) {
            query = query.lte('invoice_date', filters.date_to);
        }

        // Buyer filter (substring match on name)
        if (filters.buyer && filters.buyer.trim().length > 0) {
            query = query.ilike('buyer_business_name', `%${filters.buyer.trim()}%`);
        }

        // Amount range
        if (typeof filters.amount_min === 'number') {
            query = query.gte('total_amount', filters.amount_min);
        }
        if (typeof filters.amount_max === 'number') {
            query = query.lte('total_amount', filters.amount_max);
        }

        // Search across invoice_ref_no and buyer_business_name
        if (filters.search && filters.search.trim().length > 0) {
            const term = filters.search.trim();
            query = query.or(
                `invoice_ref_no.ilike.%${term}%,buyer_business_name.ilike.%${term}%`
            );
        }

        // Sorting
        const sortBy: InvoiceSortField = filters.sort_by || 'created_at';
        const sortDir: 'asc' | 'desc' = filters.sort_dir || 'desc';
        query = query.order(sortBy, { ascending: sortDir === 'asc' });

        // Pagination
        query = query.range(from, to);

        const { data, count, error } = await query;
        if (error) throw error;

        return {
            data: {
                items: data || [],
                total: count || 0,
            },
            error: null,
        };
    } catch (err) {
        console.error('Error in getPaginatedInvoices:', err);
        return { data: null, error: err as Error };
    }
}

/**
 * Get invoice items for an invoice
 */
export async function getInvoiceItems(invoiceId: string): Promise<{ data: Record<string, unknown>[] | null; error: unknown }> {
    try {
        const { data, error } = await supabase
            .from('invoice_items')
            .select('*')
            .eq('invoice_id', invoiceId);

        if (error) {
            throw error;
        }

        return { data, error: null };
    } catch (error) {
        console.error('Error fetching invoice items:', error);
        return { data: null, error };
    }
}

/**
 * Create invoice item
 */
export async function createInvoiceItem(itemData: Record<string, unknown>): Promise<{ data: Record<string, unknown> | null; error: unknown }> {
    try {
        const { data, error } = await supabase
            .from('invoice_items')
            .insert(itemData)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return { data, error: null };
    } catch (error) {
        console.error('Error creating invoice item:', error);
        return { data: null, error };
    }
}

/**
 * Update invoice item
 */
export async function updateInvoiceItem(
    itemId: string,
    updateData: Record<string, unknown>
): Promise<{ data: Record<string, unknown> | null; error: unknown }> {
    try {
        const { data, error } = await supabase
            .from('invoice_items')
            .update(updateData)
            .eq('id', itemId)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return { data, error: null };
    } catch (error) {
        console.error('Error updating invoice item:', error);
        return { data: null, error };
    }
}

/**
 * Delete invoice item
 */
export async function deleteInvoiceItem(itemId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase
            .from('invoice_items')
            .delete()
            .eq('id', itemId);

        if (error) {
            throw error;
        }

        return { success: true };
    } catch (error) {
        console.error('Error deleting invoice item:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}

/**
 * Update invoice status
 */
export async function updateInvoiceStatus(
    invoiceId: string,
    status: InvoiceStatus,
    metadata?: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
    try {
        const updateData: Record<string, unknown> = {
            status,
            updated_at: new Date().toISOString()
        };

        if (metadata) {
            updateData.fbr_response = JSON.stringify(metadata);
        }

        const { error } = await supabase
            .from('invoices')
            .update(updateData)
            .eq('id', invoiceId);

        if (error) {
            console.error('Error updating invoice status:', error);
            throw error;
        }

        return { success: true };
    } catch (error) {
        console.error('Failed to update invoice status:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}