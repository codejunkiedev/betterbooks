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

export interface JournalEntryData {
  id: string;
  company_id: string;
  entry_date: string;
  description: string;
  created_by_accountant_id: string;
  source_document_id?: string;
  is_adjusting_entry: boolean;
  created_at: string;
  journal_entry_lines?: JournalEntryLineData[];
}

export interface JournalEntryLineData {
  id: string;
  journal_entry_id: string;
  account_id: string;
  type: 'DEBIT' | 'CREDIT';
  amount: number;
} 