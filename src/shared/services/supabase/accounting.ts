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

export const fetchFinancialMetrics = async (period: 'month' | 'quarter' = 'month'): Promise<{
  data: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    cashBalance: number;
    period: { start: string; end: string; }
  } | null;
  error: PostgrestError | null
}> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get user's company
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (companyError) throw companyError;
    if (!company) throw new Error('Company not found');

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else {
      // Quarter calculation
      const quarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), quarter * 3, 1);
      endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
    }

    // Get journal entries for the period with their lines and account information
    const { data: journalEntries, error: entriesError } = await supabase
      .from("journal_entries")
      .select(`
        id,
        entry_date,
        journal_entry_lines (
          id,
          account_id,
          type,
          amount
        )
      `)
      .eq("company_id", company.id)
      .gte("entry_date", startDate.toISOString().split('T')[0])
      .lte("entry_date", endDate.toISOString().split('T')[0]);

    if (entriesError) throw entriesError;

    // Get account types for categorization
    const { data: accounts, error: accountsError } = await supabase
      .from("company_coa")
      .select("account_id, account_type")
      .eq("company_id", company.id);

    if (accountsError) throw accountsError;

    // Create account type lookup
    const accountTypeMap = new Map(accounts?.map(acc => [acc.account_id, acc.account_type]) || []);

    // Calculate financial metrics
    let totalRevenue = 0;
    let totalExpenses = 0;
    let cashBalance = 0;

    journalEntries?.forEach(entry => {
      entry.journal_entry_lines?.forEach(line => {
        const accountType = accountTypeMap.get(line.account_id);
        const amount = parseFloat(line.amount.toString());

        if (accountType === 'revenue') {
          if (line.type === 'CREDIT') {
            totalRevenue += amount;
          } else {
            totalRevenue -= amount;
          }
        } else if (accountType === 'expense') {
          if (line.type === 'DEBIT') {
            totalExpenses += amount;
          } else {
            totalExpenses -= amount;
          }
        } else if (accountType === 'asset' && line.account_id.startsWith('1100')) {
          // Cash accounts (1100 series)
          if (line.type === 'DEBIT') {
            cashBalance += amount;
          } else {
            cashBalance -= amount;
          }
        }
      });
    });

    // Get current cash balance from company table as fallback
    if (cashBalance === 0) {
      const { data: companyData } = await supabase
        .from("companies")
        .select("account_balance")
        .eq("id", company.id)
        .maybeSingle();

      cashBalance = companyData?.account_balance || 0;
    }

    const netProfit = totalRevenue - totalExpenses;

    return {
      data: {
        totalRevenue,
        totalExpenses,
        netProfit,
        cashBalance,
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        }
      },
      error: null
    };
  } catch (error) {
    console.error("Error fetching financial metrics:", error);
    return { data: null, error: error as PostgrestError };
  }
}; 