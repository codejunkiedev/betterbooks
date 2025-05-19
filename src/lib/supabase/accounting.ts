import { supabase } from "./client";
import { PostgrestError } from "@supabase/supabase-js";

interface AccountingSummary {
  totalDebits: number;
  totalCredits: number;
  netBalance: number;
  period: {
    start: string;
    end: string;
  };
}

interface AccountingEntry {
  id: string;
  created_at: string;
  deepseek_response: {
    debitAccount: string;
    creditAccount: string;
    amount: number;
    confidence: number;
    explanation: string;
  };
  file: {
    name: string;
  };
}

interface AccountingEntriesFilter {
  entryType?: 'debit' | 'credit' | 'all';
  dateRange?: 'this_month' | 'last_month' | 'all';
}

export const fetchAccountingSummary = async (): Promise<{ data: AccountingSummary | null; error: PostgrestError | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Get the first and last day of the current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    // Fetch all completed invoices for the current month
    const { data, error } = await supabase
      .from("invoices")
      .select("deepseek_response")
      .eq("status", "completed")
      .eq("user_id", user?.id)
      .gte("created_at", firstDay.toISOString())
      .lte("created_at", lastDay.toISOString());

    if (error) throw error;

    // Calculate totals
    const summary = data?.reduce((acc, invoice) => {
      const amount = invoice.deepseek_response?.amount || 0;
      return {
        totalDebits: acc.totalDebits + amount,
        totalCredits: acc.totalCredits + amount,
        netBalance: acc.netBalance,
        period: acc.period
      };
    }, {
      totalDebits: 0,
      totalCredits: 0,
      netBalance: 0,
      period: {
        start: firstDay.toISOString(),
        end: lastDay.toISOString()
      }
    });

    if (summary) {
      summary.netBalance = summary.totalCredits - summary.totalDebits;
    }

    return { 
      data: summary || null, 
      error: null 
    };
  } catch (error) {
    console.error("Error fetching accounting summary:", error);
    return { data: null, error: error as PostgrestError };
  }
};

export const fetchAccountingEntries = async (
  page: number = 1,
  pageSize: number = 10,
  filter?: AccountingEntriesFilter
): Promise<{ data: { items: AccountingEntry[]; total: number } | null; error: PostgrestError | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    let query = supabase
      .from("invoices")
      .select("*", { count: "exact" })
      .eq("status", "approved")
      .eq("user_id", user?.id);

    // Apply date range filter
    if (filter?.dateRange) {
      const now = new Date();
      let startDate: Date;
      let endDate: Date;

      switch (filter.dateRange) {
        case 'this_month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          break;
        case 'last_month':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          endDate = new Date(now.getFullYear(), now.getMonth(), 0);
          break;
        default: // 'all'
          startDate = new Date(0); // Beginning of time
          endDate = new Date(8640000000000000); // End of time
      }

      query = query
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());
    }

    // Get total count first
    const { count, error: countError } = await query;
    if (countError) throw countError;

    // Then get paginated data
    const { data, error } = await query
      .order("created_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) throw error;

    // Apply entry type filter in memory if needed
    let filteredData = data || [];
    if (filter?.entryType && filter.entryType !== 'all') {
      filteredData = filteredData.filter(entry => {
        if (filter.entryType === 'debit') {
          return entry.deepseek_response.debitAccount.toLowerCase() !== 'cash' && 
                 entry.deepseek_response.debitAccount.toLowerCase() !== 'accounts payable';
        } else if (filter.entryType === 'credit') {
          return entry.deepseek_response.creditAccount.toLowerCase() !== 'cash' && 
                 entry.deepseek_response.creditAccount.toLowerCase() !== 'accounts payable';
        }
        return true;
      });
    }

    // Recalculate total count after filtering
    const filteredCount = filter?.entryType && filter.entryType !== 'all' 
      ? filteredData.length 
      : count || 0;

    return {
      data: {
        items: filteredData,
        total: filteredCount
      },
      error: null
    };
  } catch (error) {
    console.error("Error fetching accounting entries:", error);
    return { data: null, error: error as PostgrestError };
  }
};

export const updateAccountingEntry = async (
  id: string,
  deepseekResponse: AccountingEntry['deepseek_response']
): Promise<{ error: PostgrestError | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from("invoices")
      .update({
        deepseek_response: deepseekResponse,
        status: "approved"
      })
      .eq("id", id)
      .eq("user_id", user?.id);

    if (error) throw error;

    return { error: null };
  } catch (error) {
    console.error("Error updating accounting entry:", error);
    return { error: error as PostgrestError };
  }
}; 