export interface DashboardStats {
    totalDocuments: number;
    totalSuggestions: number;
    approvedInvoices: number;
  }


export interface StatsGridProps {
    stats: DashboardStats | null;
    isLoading: boolean;
  }
