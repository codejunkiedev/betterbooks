import { supabase } from "@/shared/services/supabase/client";

export interface JournalEntry {
    id: string;
    company_id: string;
    entry_date: string;
    description: string;
    created_by_accountant_id?: string;
    created_by_user_id?: string;
    source_document_id?: string;
    is_adjusting_entry: boolean;
    created_at: string;
}

export interface JournalEntryLine {
    id: string;
    journal_entry_id: string;
    account_id: string;
    type: 'DEBIT' | 'CREDIT';
    amount: number;
}

export interface CreateJournalEntryParams {
    company_id: string;
    entry_date: string;
    description: string;
    created_by?: string;
    source_document_id?: string;
    is_adjusting_entry?: boolean;
    lines: Array<{
        account_id: string;
        type: 'DEBIT' | 'CREDIT';
        amount: number;
    }>;
}

// Create a new journal entry with lines
export async function createJournalEntry(params: CreateJournalEntryParams): Promise<JournalEntry> {
    const { lines, ...entryData } = params;

    // Start a transaction
    const { data: entry, error: entryError } = await supabase
        .from("journal_entries")
        .insert(entryData)
        .select()
        .single();

    if (entryError) {
        console.error("Error creating journal entry:", entryError);
        throw entryError;
    }

    // Create journal entry lines
    const linesWithEntryId = lines.map(line => ({
        ...line,
        journal_entry_id: entry.id,
    }));

    const { error: linesError } = await supabase
        .from("journal_entry_lines")
        .insert(linesWithEntryId);

    if (linesError) {
        console.error("Error creating journal entry lines:", linesError);
        throw linesError;
    }

    return entry;
}

// Get journal entries for a company
export async function getCompanyJournalEntries(companyId: string): Promise<JournalEntry[]> {
    const { data, error } = await supabase
        .from("journal_entries")
        .select(`
      *,
      journal_entry_lines (
        id,
        account_id,
        type,
        amount
      )
    `)
        .eq("company_id", companyId)
        .order("entry_date", { ascending: false });

    if (error) {
        console.error("Error fetching journal entries:", error);
        throw error;
    }

    return data || [];
}

// Get opening balance journal entry for a company
export async function getOpeningBalanceJournalEntry(companyId: string): Promise<JournalEntry | null> {
    const { data, error } = await supabase
        .from("journal_entries")
        .select(`
      *,
      journal_entry_lines (
        id,
        account_id,
        type,
        amount
      )
    `)
        .eq("company_id", companyId)
        .eq("description", "Opening Balance")
        .maybeSingle();

    if (error) {
        console.error("Error fetching opening balance journal entry:", error);
        throw error;
    }

    return data;
}

// Create opening balance journal entry and update company balance
export async function createOpeningBalanceJournalEntry(
    companyId: string,
    userId: string,
    amount: number,
    date: string
): Promise<{ entry: JournalEntry; companyUpdated: boolean }> {
    // Get the cash account from company COA
    const { data: cashAccount, error: accountError } = await supabase
        .from("company_coa")
        .select("id")
        .eq("company_id", companyId)
        .eq("account_name", "Cash and Cash Equivalents")
        .maybeSingle();

    if (accountError) {
        console.error("Error fetching cash account:", accountError);
        throw accountError;
    }

    if (!cashAccount) {
        throw new Error("Cash account not found in company chart of accounts");
    }

    // For now, create a simple opening balance entry
    // In a real system, you'd want proper double-entry bookkeeping

    const entry = await createJournalEntry({
        company_id: companyId,
        entry_date: date,
        description: "Opening Balance",
        created_by: userId,
        is_adjusting_entry: false,
        lines: [
            {
                account_id: cashAccount.id,
                type: "DEBIT",
                amount: amount,
            },
        ],
    });

    // Update company account balance
    const { error: companyError } = await supabase
        .from("companies")
        .update({
            account_balance: amount,
            opening_balance: amount,
            closing_balance: amount,
        })
        .eq("id", companyId)
        .eq("user_id", userId);

    if (companyError) {
        console.error("Error updating company balance:", companyError);
        throw companyError;
    }

    return { entry, companyUpdated: true };
} 