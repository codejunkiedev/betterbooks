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

// Get journal entries with account names for display
export async function getUserJournalEntries(): Promise<{
    data: Array<{
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
    }> | null;
    error: Error | null;
}> {
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

        // Get journal entries with lines
        const { data: journalEntries, error: entriesError } = await supabase
            .from("journal_entries")
            .select(`
        id,
        entry_date,
        description,
        is_adjusting_entry,
        created_at,
        journal_entry_lines (
          id,
          account_id,
          type,
          amount
        )
      `)
            .eq("company_id", company.id)
            .order("entry_date", { ascending: false })
            .order("created_at", { ascending: false });

        if (entriesError) throw entriesError;

        // Get account names for all account IDs
        const accountIds = new Set<string>();
        journalEntries?.forEach(entry => {
            entry.journal_entry_lines?.forEach(line => {
                accountIds.add(line.account_id);
            });
        });

        const { data: accounts, error: accountsError } = await supabase
            .from("company_coa")
            .select("id, account_name")
            .eq("company_id", company.id)
            .in("id", Array.from(accountIds));

        if (accountsError) throw accountsError;

        // Create account name lookup
        const accountNameMap = new Map(accounts?.map(acc => [acc.id, acc.account_name]) || []);

        // Add account names to journal entries
        const entriesWithAccountNames = journalEntries?.map(entry => ({
            ...entry,
            lines: entry.journal_entry_lines?.map(line => ({
                ...line,
                account_name: accountNameMap.get(line.account_id) || 'Unknown Account'
            })) || []
        })) || [];

        return {
            data: entriesWithAccountNames,
            error: null
        };
    } catch (error) {
        console.error("Error fetching user journal entries:", error);
        return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
    }
}

// Get paginated journal entries with backend filtering
export async function getPaginatedJournalEntries(
    page: number,
    itemsPerPage: number,
    filters?: {
        search?: string;
        date_from?: string;
        date_to?: string;
        amount_min?: number;
        amount_max?: number;
        entry_type?: 'all' | 'regular' | 'adjusting';
    }
): Promise<{
    data: {
        items: Array<{
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
        }>;
        total: number;
        page: number;
        itemsPerPage: number;
        totalPages: number;
    } | null;
    error: Error | null;
}> {
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

        // Build the base query
        let query = supabase
            .from("journal_entries")
            .select(`
                id,
                entry_date,
                description,
                is_adjusting_entry,
                created_at,
                journal_entry_lines (
                    id,
                    account_id,
                    type,
                    amount
                )
            `, { count: 'exact' })
            .eq("company_id", company.id);

        // Apply filters
        if (filters?.search) {
            // Search in description only - more reliable and simpler
            query = query.ilike('description', `%${filters.search}%`);
        }

        if (filters?.date_from) {
            query = query.gte('entry_date', filters.date_from);
        }

        if (filters?.date_to) {
            query = query.lte('entry_date', filters.date_to);
        }

        if (filters?.entry_type && filters.entry_type !== 'all') {
            const isAdjusting = filters.entry_type === 'adjusting';
            query = query.eq('is_adjusting_entry', isAdjusting);
        }

        // Get total count first
        const { count, error: countError } = await query;
        if (countError) throw countError;

        const total = count || 0;
        const totalPages = Math.ceil(total / itemsPerPage);

        // Apply pagination
        const from = (page - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;

        const { data: journalEntries, error: entriesError } = await query
            .order("entry_date", { ascending: false })
            .order("created_at", { ascending: false })
            .range(from, to);

        if (entriesError) throw entriesError;

        // Get account names for all account IDs
        const accountIds = new Set<string>();
        journalEntries?.forEach(entry => {
            entry.journal_entry_lines?.forEach(line => {
                accountIds.add(line.account_id);
            });
        });

        const { data: accounts, error: accountsError } = await supabase
            .from("company_coa")
            .select("id, account_name")
            .eq("company_id", company.id)
            .in("id", Array.from(accountIds));

        if (accountsError) throw accountsError;

        // Create account name lookup
        const accountNameMap = new Map(accounts?.map(acc => [acc.id, acc.account_name]) || []);

        // Add account names to journal entries and filter by amount if needed
        let entriesWithAccountNames = journalEntries?.map(entry => ({
            ...entry,
            lines: entry.journal_entry_lines?.map(line => ({
                ...line,
                account_name: accountNameMap.get(line.account_id) || 'Unknown Account'
            })) || []
        })) || [];

        // Apply amount filtering on the client side since it involves line items
        if (filters?.amount_min || filters?.amount_max) {
            entriesWithAccountNames = entriesWithAccountNames.filter(entry => {
                return entry.lines.some(line => {
                    const amount = line.amount;
                    const minOk = !filters.amount_min || amount >= filters.amount_min;
                    const maxOk = !filters.amount_max || amount <= filters.amount_max;
                    return minOk && maxOk;
                });
            });
        }

        return {
            data: {
                items: entriesWithAccountNames,
                total,
                page,
                itemsPerPage,
                totalPages
            },
            error: null
        };
    } catch (error) {
        console.error("Error fetching paginated journal entries:", error);
        return {
            data: null,
            error: error instanceof Error ? error : new Error('Unknown error')
        };
    }
} 