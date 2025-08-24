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