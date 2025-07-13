import { JournalEntry } from '../entities/JournalEntry';

export interface TrialBalanceEntry {
    accountId: string;
    accountName: string;
    accountType: string;
    totalDebits: number;
    totalCredits: number;
    balance: number;
}

export interface TrialBalance {
    entries: TrialBalanceEntry[];
    totalDebits: number;
    totalCredits: number;
    isBalanced: boolean;
}

export interface IJournalEntryRepository {
    findById(id: string): Promise<JournalEntry | null>;
    findByCompanyId(companyId: string): Promise<JournalEntry[]>;
    findByAccountantId(accountantId: string): Promise<JournalEntry[]>;
    findByDateRange(companyId: string, startDate: Date, endDate: Date): Promise<JournalEntry[]>;
    findBySourceDocument(sourceDocumentId: string): Promise<JournalEntry[]>;
    save(journalEntry: JournalEntry): Promise<JournalEntry>;
    update(journalEntry: JournalEntry): Promise<JournalEntry>;
    delete(id: string): Promise<void>;
    findAll(): Promise<JournalEntry[]>;
    findAdjustingEntries(companyId: string): Promise<JournalEntry[]>;
    getTrialBalance(companyId: string, asOfDate: Date): Promise<TrialBalance>;
} 