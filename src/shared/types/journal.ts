export interface JournalEntry {
    id: string;
    entry_date: string;
    description: string;
    is_adjusting_entry: boolean;
    created_at: string;
    lines: Array<{
        id: string;
        account_id: string;
        account_name: string;
        type: 'DEBIT' | 'CREDIT';
        amount: number;
    }>;
} 