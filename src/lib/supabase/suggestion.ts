import { supabase } from "./client";
import { InvoiceSuggestionType, PaginatedResponse } from "@/interfaces/suggestion";
import { PostgrestError } from "@supabase/supabase-js";
import { CreateLineItemData } from '../../interfaces/line-item';
import { createLineItem } from './line-item';

export const fetchInvoiceSuggestions = async (page: number = 1, pageSize: number = 10): Promise<{ data: PaginatedResponse | null; error: PostgrestError | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // First, get the total count
    const { count, error: countError } = await supabase
      .from("invoices")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed")
      .eq("user_id", user?.id);

    if (countError) throw countError;

    // Then, get the paginated data
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("status", "completed")
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

export const updateInvoiceSuggestion = async (id: string, deepseekResponse: InvoiceSuggestionType['deepseek_response']) => {
  try {
    // Simply update the invoice status and data
    const { error } = await supabase
      .from("invoices")
      .update({
        status: "approved",
        data: deepseekResponse
      })
      .eq("id", id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error("Error saving changes:", error);
    return { error };
  }
};
