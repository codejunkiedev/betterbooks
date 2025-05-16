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