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
  data: {
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
    const { data, error } = await supabase.from("companies").select("*").eq("user_id", user?.id).maybeSingle();
    if (error) throw error;
    return {
    data: {
      totalDebits: data?.total_debit || 0,
      totalCredits: data?.total_credit || 0,
      netBalance: data?.account_balance || 0,
      period: {
        start: new Date().toISOString(),
        end: new Date().toISOString()
      }
    },
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
  data: AccountingEntry['data']
): Promise<{ error: PostgrestError | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from("invoices")
      .update({
        data: data,
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