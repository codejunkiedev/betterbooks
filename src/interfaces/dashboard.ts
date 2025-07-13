export interface DashboardStats {
  totalDocuments: number;
  totalSuggestions: number;
  approvedInvoices: number;
}


export interface StatsGridProps {
  stats: DashboardStats | null;
  isLoading: boolean;
}

export interface SystemStats {
  totalUsers: number;
  totalCompanies: number;
  totalAccountants: number;
  totalDocuments: number;
}

export interface RecentActivity {
  id: string;
  type: 'user_registration' | 'company_creation' | 'document_upload' | 'accountant_assignment';
  timestamp: string;
  details: {
    userId?: string;
    companyId?: string;
    documentId?: string;
    accountantId?: string;
    action: string;
    description: string;
  };
}
