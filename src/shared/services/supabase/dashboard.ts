import { DashboardStats } from "@/shared/types/dashboard";
import { supabase } from "./client";

export const fetchDashboardStats = async (): Promise<{ data: DashboardStats | null; error: unknown }> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user?.id) throw new Error("User not authenticated");

    const [
      { count: totalDocuments, error: documentsError },
      { count: totalSuggestions, error: suggestionsError },
      { count: approvedInvoices, error: approvedError }
    ] = await Promise.all([
      supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id),
      supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'completed'),
      supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'approved')
    ]);

    if (documentsError) throw documentsError;
    if (suggestionsError) throw suggestionsError;
    if (approvedError) throw approvedError;

    return {
      data: {
        totalDocuments: totalDocuments || 0,
        totalSuggestions: totalSuggestions || 0,
        approvedInvoices: approvedInvoices || 0,
      },
      error: null
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      data: null,
      error
    };
  }
};
