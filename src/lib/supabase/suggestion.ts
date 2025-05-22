import { supabase } from "./client";
import { InvoiceSuggestionType, PaginatedResponse } from "@/interfaces/suggestion";
import { PostgrestError } from "@supabase/supabase-js";
// import { CreateLineItemData } from '../../interfaces/line-item';
// import { createLineItem } from './line-item';

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

export const approveInvoiceSuggestion = async (
  id: string,
  suggestion: InvoiceSuggestionType
): Promise<{ error: PostgrestError | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // Get current company data
    const { data: companyData, error: companyError } = await supabase
      .from("companies")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (companyError) throw companyError;
    if (!companyData) throw new Error("Company data not found");

    console.log({companyData, suggestion});
    // Calculate new balances
    const currentBalance = companyData.account_balance;
    const amount = suggestion.deepseek_response.amount;
    const newOpeningBalance = currentBalance;
    const newClosingBalance = newOpeningBalance + (suggestion.type === 'debit' ? amount : -amount);
    const newAccountBalance = newClosingBalance;

    // Update invoice with new balances
    const { error: invoiceError } = await supabase
      .from('invoices')
      .update({
        status: "approved",
        opening_balance: newOpeningBalance,
        closing_balance: newClosingBalance,
        data: suggestion.deepseek_response
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (invoiceError) {
      console.error('Error updating invoice:', invoiceError);
      throw new Error('Failed to update invoice');
    }

    // Update company account balance
    const { error: updateCompanyError } = await supabase
      .from('companies')
      .update({ 
        account_balance: newAccountBalance,
        opening_balance: newOpeningBalance,
        closing_balance: newClosingBalance,
        ...(suggestion.type === 'debit' && { total_debit: companyData?.total_debit + amount }),
        ...(suggestion.type === 'credit' && { total_credit: companyData?.total_credit + amount }),
       })
      .eq('id', companyData.id)
      .eq('user_id', user.id);

    if (updateCompanyError) throw updateCompanyError;

    return { error: null };
  } catch (error) {
    console.error("Error approving invoice suggestion:", error);
    return { error: error as PostgrestError };
  }
};