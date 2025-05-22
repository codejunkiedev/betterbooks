export interface AccountingEntriesFilter {
  entryType?: 'all' | 'debit' | 'credit';
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface AccountingEntry {
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
    path: string;
  };
}

export interface AccountingSummaryType {
  totalDebits: number;
  totalCredits: number;
  netBalance: number;
  period: {
    start: string;
    end: string;
  };
} 