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
    // Start a transaction to ensure all or none of the operations succeed
    const { error: transactionError } = await supabase.rpc('begin_transaction');
    if (transactionError) throw transactionError;

    // Update the invoice with the deepseek response
    const { error: updateError } = await supabase
      .from("invoices")
      .update({
        status: "approved",
        data: deepseekResponse
      })
      .eq("id", id);

    if (updateError) {
      await supabase.rpc('rollback_transaction');
      throw updateError;
    }

    // If there are line items in the response and they are assets, save them to the line_items table
    if (deepseekResponse.line_items && Array.isArray(deepseekResponse.line_items)) {
      const assetLineItems = deepseekResponse.line_items.filter(item => item.is_asset);
      
      if (assetLineItems.length > 0) {
        // Create line items for each asset
        for (const item of assetLineItems) {
          const lineItemData: CreateLineItemData = {
            invoice_id: id,
            description: item.description,
            amount: item.amount,
            quantity: item.quantity,
            unit_price: item.unit_price,
            is_asset: true,
            asset_type: item.asset_type,
            asset_life_months: item.asset_life_months
          };

          const { error: createError } = await createLineItem(lineItemData);
          if (createError) {
            await supabase.rpc('rollback_transaction');
            throw createError;
          }
        }
      }
    }

    await supabase.rpc('commit_transaction');
    return { error: null };
  } catch (error) {
    console.error("Error saving changes:", error);
    await supabase.rpc('rollback_transaction');
    return { error };
  }
};
