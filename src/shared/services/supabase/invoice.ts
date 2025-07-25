import { supabase } from './client';
import { ApiResponse } from '@/shared/types/api';
import {
    InvoiceData,
    CreateInvoiceData,
    UpdateInvoiceData
} from '@/shared/types/invoice';
import { getCurrentUser } from './auth';
import { PaginatedResponse } from '@/shared/types/suggestion';
import { PostgrestError } from '@supabase/supabase-js';

// Helper function to get current user

export const uploadInvoice = async (
    data: CreateInvoiceData
): Promise<ApiResponse<InvoiceData[]>> => {
    try {
        const { user, error: userError } = await getCurrentUser();

        if (userError || !user) {
            throw new Error('User not authenticated');
        }

        // Create invoice records for each file
        const invoicePromises = data?.files?.map(file =>
            supabase
                .from('invoices')
                .insert({
                    user_id: user.id,
                    file: file,
                    data: {},
                    ocr_response: {},
                    deepseek_response: {},
                    status: 'pending',
                    type: data.type,
                    opening_balance: 0,
                    closing_balance: 0
                })
                .select()
                .single()
        );
        // Wait for all insertions to complete
        const results = await Promise.all(invoicePromises || []);

        // Check for any errors
        const errors = results.filter((result) => result.error);
        if (errors.length > 0) {
            throw new Error('Some invoices failed to upload: ' + errors.map(e => e.error?.message).join(', '));
        }

        // Extract successful results
        const invoices = results.map(result => result.data);

        return {
            data: invoices,
            error: null
        };
    } catch (error) {
        console.error('Error uploading invoices:', error);
        return {
            data: null,
            error: error as Error
        };
    }
};

// Helper function to get all invoices for the current user
export const getInvoices = async (): Promise<ApiResponse<InvoiceData[]>> => {
    try {
        const { user, error: userError } = await getCurrentUser();

        if (userError || !user) {
            throw new Error('User not authenticated');
        }

        const { data: invoices, error } = await supabase
            .from('invoices')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return {
            data: invoices,
            error: null
        };
    } catch (error) {
        console.error('Error fetching invoices:', error);
        return {
            data: null,
            error: error as Error
        };
    }
};

// Helper function to get a single invoice by ID
export const getInvoice = async (id: string): Promise<ApiResponse<InvoiceData>> => {
    try {
        const { user, error: userError } = await getCurrentUser();

        if (userError || !user) {
            throw new Error('User not authenticated');
        }

        const { data: invoice, error } = await supabase
            .from('invoices')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (error) throw error;

        return {
            data: invoice,
            error: null
        };
    } catch (error) {
        console.error('Error fetching invoice:', error);
        return {
            data: null,
            error: error as Error
        };
    }
};

// Helper function to update an invoice
export const updateInvoice = async (
    id: string,
    updates: UpdateInvoiceData
): Promise<ApiResponse<InvoiceData>> => {
    try {
        const { user, error: userError } = await getCurrentUser();

        if (userError || !user) {
            throw new Error('User not authenticated');
        }

        const { data: invoice, error } = await supabase
            .from('invoices')
            .update(updates)
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) throw error;

        return {
            data: invoice,
            error: null
        };
    } catch (error) {
        console.error('Error updating invoice:', error);
        return {
            data: null,
            error: error as Error
        };
    }
};

// Helper function to delete an invoice
export const deleteInvoice = async (id: string): Promise<ApiResponse<void>> => {
    try {
        const { user, error: userError } = await getCurrentUser();

        if (userError || !user) {
            throw new Error('User not authenticated');
        }

        const { error } = await supabase
            .from('invoices')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) throw error;

        return {
            data: undefined,
            error: null
        };
    } catch (error) {
        console.error('Error deleting invoice:', error);
        return {
            data: null,
            error: error as Error
        };
    }
};

export const fetchInvoices = async (page: number = 1, pageSize: number = 10): Promise<{ data: PaginatedResponse | null; error: PostgrestError | null }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        // First, get the total count
        const { count, error: countError } = await supabase
            .from("invoices")
            .select("*", { count: "exact", head: true })
            .eq("status", "approved")
            .eq("user_id", user?.id);

        if (countError) throw countError;

        // Then, get the paginated data
        const { data, error } = await supabase
            .from("invoices")
            .select("*")
            .eq("status", "approved")
            .eq("user_id", user?.id)
            .order("created_at", { ascending: false })
            .range((page - 1) * pageSize, page * pageSize - 1);

        if (error) throw error;

        return {
            data: {
                items: data || [],
                total: count || 0
            },
            error: null
        };
    } catch (error) {
        console.error("Error fetching invoice suggestions:", error);
        return { data: null, error: error as PostgrestError };
    }
};