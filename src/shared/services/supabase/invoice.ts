import { supabase } from './client';
import { HSCode, HSCodeSearchResult, UoMValidationCache, InvoiceStatus, InvoiceFormData } from '@/shared/types/invoice';
import { INVOICE_STATUS } from '@/shared/constants/invoice';
import { convertToInvoiceDB, convertCalculatedItemsToDB } from '@/shared/utils/fbr';

export interface InvoiceSequence {
    user_id: string;
    year: number;
    last_number: number;
    created_at: string;
    updated_at: string;
}

/**
 * Generate FBR-compliant invoice number for preview (doesn't increment sequence)
 * Format: NTN-YYYY-MM-XXXXX
 * Example: 1234567-2025-01-00001
 */
export async function generateFBRInvoiceNumberForPreview(userId: string, year: number, month: number): Promise<string> {
    try {
        // Get user's NTN/CNIC from fbr_profiles
        const { data: userProfile, error: profileError } = await supabase
            .from('fbr_profiles')
            .select('cnic_ntn')
            .eq('user_id', userId)
            .single();

        if (profileError) {
            if (profileError.code === 'PGRST116') {
                throw new Error('FBR profile not found. Please complete onboarding first.');
            }
            console.error('Error getting user NTN/CNIC:', profileError);
            throw new Error('User NTN/CNIC not found in FBR profile');
        }

        if (!userProfile?.cnic_ntn) {
            throw new Error('User NTN/CNIC not found in FBR profile');
        }

        const ntnCnic = userProfile.cnic_ntn;

        // Get current sequence number without incrementing
        try {
            const { data: sequenceData, error: sequenceError } = await supabase
                .from('invoice_sequences')
                .select('last_number')
                .eq('user_id', userId)
                .eq('year', year)
                .single();

            let sequenceNumber = 1; // Default to 1 if no sequence exists

            if (!sequenceError && sequenceData) {
                sequenceNumber = sequenceData.last_number + 1; // Next number without saving
            }

            // Format: NTN-YYYY-MM-XXXXX
            return `${ntnCnic}-${year}-${month.toString().padStart(2, '0')}-${sequenceNumber.toString().padStart(5, '0')}`;
        } catch (rpcError) {
            console.warn('Error getting current sequence, using fallback approach:', rpcError);

            // Fallback: Generate a simple sequence number based on timestamp
            const timestamp = Date.now();
            const sequenceNumber = (timestamp % 99999) + 1; // Ensure 5 digits max

            // Format: NTN-YYYY-MM-XXXXX
            return `${ntnCnic}-${year}-${month.toString().padStart(2, '0')}-${sequenceNumber.toString().padStart(5, '0')}`;
        }
    } catch (error) {
        console.error('Failed to generate FBR invoice number for preview:', error);
        throw new Error('Failed to generate FBR invoice number for preview');
    }
}

/**
 * Generate FBR-compliant invoice number (increments sequence when saving)
 * Format: NTN-YYYY-MM-XXXXX
 * Example: 1234567-2025-01-00001
 */
export async function generateFBRInvoiceNumber(userId: string, year: number, month: number): Promise<string> {
    try {
        // Get user's NTN/CNIC from fbr_profiles
        const { data: userProfile, error: profileError } = await supabase
            .from('fbr_profiles')
            .select('cnic_ntn')
            .eq('user_id', userId)
            .single();

        if (profileError) {
            if (profileError.code === 'PGRST116') {
                throw new Error('FBR profile not found. Please complete onboarding first.');
            }
            console.error('Error getting user NTN/CNIC:', profileError);
            throw new Error('User NTN/CNIC not found in FBR profile');
        }

        if (!userProfile?.cnic_ntn) {
            throw new Error('User NTN/CNIC not found in FBR profile');
        }

        const ntnCnic = userProfile.cnic_ntn;

        // Try to get next sequence number using existing invoice_sequences table
        try {
            const { data, error } = await supabase.rpc('get_next_invoice_number', {
                user_uuid: userId,
                invoice_year: year
            });

            if (error) {
                console.error('Error calling get_next_invoice_number RPC:', error);
                throw error;
            }

            if (!data) {
                throw new Error('No data returned from get_next_invoice_number');
            }

            // Extract the sequence number from the returned format (YYYY-UUID-NUMBER)
            const sequenceNumber = data.split('-').pop() || '1';

            // Format: NTN-YYYY-MM-XXXXX
            return `${ntnCnic}-${year}-${month.toString().padStart(2, '0')}-${sequenceNumber.padStart(5, '0')}`;
        } catch (rpcError) {
            console.warn('RPC function failed, using fallback approach:', rpcError);

            // Fallback: Generate a simple sequence number based on timestamp
            const timestamp = Date.now();
            const sequenceNumber = (timestamp % 99999) + 1; // Ensure 5 digits max

            // Format: NTN-YYYY-MM-XXXXX
            return `${ntnCnic}-${year}-${month.toString().padStart(2, '0')}-${sequenceNumber.toString().padStart(5, '0')}`;
        }
    } catch (error) {
        console.error('Failed to generate FBR invoice number:', error);
        throw new Error('Failed to generate FBR invoice number');
    }
}

/**
 * Generate next invoice number for a user in a specific year
 */
export async function generateInvoiceNumber(userId: string, year: number): Promise<string> {
    try {
        const currentMonth = new Date().getMonth() + 1; // 1-12
        return await generateFBRInvoiceNumber(userId, year, currentMonth);
    } catch (error) {
        console.error('Failed to generate invoice number:', error);
        // Fallback to old format if FBR generation fails
        const { data, error: fallbackError } = await supabase.rpc('get_next_invoice_number', {
            user_uuid: userId,
            invoice_year: year
        });

        if (fallbackError) {
            console.error('Error generating fallback invoice number:', fallbackError);
            throw fallbackError;
        }

        // Format: INV-YYYY-XXXX (e.g., INV-2025-0001)
        const sequenceNumber = data.split('-').pop() || '0001';
        return `INV-${year}-${sequenceNumber.padStart(4, '0')}`;
    }
}

/**
 * Save invoice to database
 */
export async function saveInvoice(
    userId: string,
    invoiceData: InvoiceFormData,
    fbrResponse?: Record<string, unknown>
): Promise<{ success: boolean; invoiceId?: string; error?: string }> {
    try {
        let invoiceRefNo = invoiceData.invoiceRefNo;

        // Check if FBR response contains an invoice number and use it as the invoice_ref_no
        if (fbrResponse && fbrResponse.invoiceNumber) {
            invoiceRefNo = fbrResponse.invoiceNumber as string;
        }

        // Generate invoice number if not provided
        if (!invoiceRefNo) {
            const year = new Date(invoiceData.invoiceDate).getFullYear();
            const currentMonth = new Date(invoiceData.invoiceDate).getMonth() + 1;
            invoiceRefNo = await generateFBRInvoiceNumber(userId, year, currentMonth);
        }

        // Determine invoice status based on FBR response
        let invoiceStatus: typeof INVOICE_STATUS[keyof typeof INVOICE_STATUS] = INVOICE_STATUS.DRAFT;
        if (fbrResponse) {
            if (fbrResponse.validationResponse) {
                const validationResponse = fbrResponse.validationResponse as Record<string, unknown>;
                if (validationResponse.statusCode === '00' && validationResponse.status === 'Valid') {
                    invoiceStatus = INVOICE_STATUS.APPROVED;
                } else {
                    invoiceStatus = INVOICE_STATUS.REJECTED;
                }
            } else {
                invoiceStatus = INVOICE_STATUS.SUBMITTED;
            }
        }

        // Convert to database format
        const invoiceDB = convertToInvoiceDB(invoiceData, userId);
        invoiceDB.invoice_ref_no = invoiceRefNo;
        if (fbrResponse) {
            invoiceDB.fbr_response = fbrResponse;
        }
        invoiceDB.status = invoiceStatus;

        // Save invoice data to database
        const { data, error } = await supabase
            .from('invoices')
            .insert(invoiceDB)
            .select('id')
            .single();

        if (error) {
            console.error('Error saving invoice:', error);
            throw error;
        }

        // Save invoice items
        if (invoiceData.items.length > 0) {
            const itemsToInsert = convertCalculatedItemsToDB(invoiceData.items, data.id);

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
 * Get invoices by user ID with optional filtering
 */
export async function getInvoicesByUser(
    userId: string,
    options: {
        status?: typeof INVOICE_STATUS[keyof typeof INVOICE_STATUS];
        limit?: number;
        offset?: number;
        orderBy?: 'created_at' | 'updated_at' | 'invoice_date';
        orderDirection?: 'asc' | 'desc';
    } = {}
): Promise<{ data: Record<string, unknown>[] | null; error: unknown; count?: number }> {
    try {
        const { status, limit = 50, offset = 0, orderBy = 'created_at', orderDirection = 'desc' } = options;

        let query = supabase
            .from('invoices')
            .select(`
                *,
                invoice_items (*)
            `, { count: 'exact' })
            .eq('user_id', userId)
            .order(orderBy, { ascending: orderDirection === 'asc' })
            .range(offset, offset + limit - 1);

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error, count } = await query;

        return { data, error, count: count || 0 };
    } catch (error) {
        console.error('Failed to get invoices by user:', error);
        return { data: null, error };
    }
}

/**
 * Get successful FBR submissions (approved invoices)
 */
export async function getSuccessfulFBRSubmissions(
    userId: string,
    options: {
        limit?: number;
        offset?: number;
    } = {}
): Promise<{ data: Record<string, unknown>[] | null; error: unknown; count?: number }> {
    return getInvoicesByUser(userId, {
        ...options,
        status: INVOICE_STATUS.APPROVED
    });
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

    // Map to HSCodeSearchResult expected shape used by UI (hS_CODE capitalization)
    return (data || []).map((row: { hs_code: string; description: string }) => ({
        hS_CODE: row.hs_code,
        description: row.description,
    }));
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
 * Check if HS code cache has data to prevent infinite cache population
 */
export async function checkCacheStatus(): Promise<{ hasData: boolean; count: number }> {
    const { count, error } = await supabase
        .from('hs_codes_cache')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.warn('Failed to check cache status:', error);
        return { hasData: false, count: 0 };
    }

    return { hasData: (count || 0) > 0, count: count || 0 };
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