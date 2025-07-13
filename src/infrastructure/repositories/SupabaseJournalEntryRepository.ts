import { SupabaseClient } from '@supabase/supabase-js';
import { IJournalEntryRepository, TrialBalance, TrialBalanceEntry } from '../../core/domain/repositories/IJournalEntryRepository';
import { JournalEntry } from '../../core/domain/entities/JournalEntry';
import { JournalEntryLine } from '../../core/domain/entities/JournalEntryLine';
import { JournalEntryData, JournalEntryLineData } from '../../interfaces/accounting';

export class SupabaseJournalEntryRepository implements IJournalEntryRepository {
    constructor(private supabase: SupabaseClient) { }

    async findById(id: string): Promise<JournalEntry | null> {
        try {
            const { data, error } = await this.supabase
                .from('journal_entries')
                .select(`
                    *,
                    journal_entry_lines(*),
                    documents(original_filename, file_path),
                    accountants(full_name)
                `)
                .eq('id', id)
                .single();

            if (error) {
                console.error('Error finding journal entry by ID:', error);
                return null;
            }

            if (!data) return null;

            return this.mapToJournalEntry(data);
        } catch (error) {
            console.error('Error in findById:', error);
            return null;
        }
    }

    async findByCompanyId(companyId: string): Promise<JournalEntry[]> {
        try {
            const { data, error } = await this.supabase
                .from('journal_entries')
                .select(`
                    *,
                    journal_entry_lines(*),
                    documents(original_filename, file_path),
                    accountants(full_name)
                `)
                .eq('company_id', companyId)
                .order('entry_date', { ascending: false });

            if (error) {
                console.error('Error finding journal entries by company ID:', error);
                return [];
            }

            return data?.map(this.mapToJournalEntry) || [];
        } catch (error) {
            console.error('Error in findByCompanyId:', error);
            return [];
        }
    }

    async findByAccountantId(accountantId: string): Promise<JournalEntry[]> {
        try {
            const { data, error } = await this.supabase
                .from('journal_entries')
                .select(`
                    *,
                    journal_entry_lines(*),
                    documents(original_filename, file_path),
                    accountants(full_name)
                `)
                .eq('created_by_accountant_id', accountantId)
                .order('entry_date', { ascending: false });

            if (error) {
                console.error('Error finding journal entries by accountant ID:', error);
                return [];
            }

            return data?.map(this.mapToJournalEntry) || [];
        } catch (error) {
            console.error('Error in findByAccountantId:', error);
            return [];
        }
    }

    async findByDateRange(companyId: string, startDate: Date, endDate: Date): Promise<JournalEntry[]> {
        try {
            const { data, error } = await this.supabase
                .from('journal_entries')
                .select(`
                    *,
                    journal_entry_lines(*),
                    documents(original_filename, file_path),
                    accountants(full_name)
                `)
                .eq('company_id', companyId)
                .gte('entry_date', startDate.toISOString().split('T')[0])
                .lte('entry_date', endDate.toISOString().split('T')[0])
                .order('entry_date', { ascending: false });

            if (error) {
                console.error('Error finding journal entries by date range:', error);
                return [];
            }

            return data?.map(this.mapToJournalEntry) || [];
        } catch (error) {
            console.error('Error in findByDateRange:', error);
            return [];
        }
    }

    async findBySourceDocument(sourceDocumentId: string): Promise<JournalEntry[]> {
        try {
            const { data, error } = await this.supabase
                .from('journal_entries')
                .select(`
                    *,
                    journal_entry_lines(*),
                    documents(original_filename, file_path),
                    accountants(full_name)
                `)
                .eq('source_document_id', sourceDocumentId)
                .order('entry_date', { ascending: false });

            if (error) {
                console.error('Error finding journal entries by source document:', error);
                return [];
            }

            return data?.map(this.mapToJournalEntry) || [];
        } catch (error) {
            console.error('Error in findBySourceDocument:', error);
            return [];
        }
    }

    async save(journalEntry: JournalEntry): Promise<JournalEntry> {
        try {
            // Start a transaction
            const { data: entryData, error: entryError } = await this.supabase
                .from('journal_entries')
                .insert({
                    id: journalEntry.id,
                    company_id: journalEntry.companyId,
                    entry_date: journalEntry.entryDate.toISOString().split('T')[0],
                    description: journalEntry.description,
                    created_by_accountant_id: journalEntry.createdByAccountantId,
                    source_document_id: journalEntry.sourceDocumentId,
                    is_adjusting_entry: journalEntry.isAdjustingEntry
                })
                .select()
                .single();

            if (entryError) {
                console.error('Error saving journal entry:', entryError);
                throw new Error(`Failed to save journal entry: ${entryError.message}`);
            }

            // Save journal entry lines
            const linesData = journalEntry.lines.map(line => ({
                journal_entry_id: entryData.id,
                account_id: line.accountId,
                type: line.type,
                amount: line.amount
            }));

            const { error: linesError } = await this.supabase
                .from('journal_entry_lines')
                .insert(linesData);

            if (linesError) {
                console.error('Error saving journal entry lines:', linesError);
                throw new Error(`Failed to save journal entry lines: ${linesError.message}`);
            }

            // Return the saved journal entry
            return await this.findById(entryData.id) || journalEntry;
        } catch (error) {
            console.error('Error in save:', error);
            throw error;
        }
    }

    async update(journalEntry: JournalEntry): Promise<JournalEntry> {
        try {
            // Update the journal entry
            const { error: entryError } = await this.supabase
                .from('journal_entries')
                .update({
                    entry_date: journalEntry.entryDate.toISOString().split('T')[0],
                    description: journalEntry.description,
                    source_document_id: journalEntry.sourceDocumentId,
                    is_adjusting_entry: journalEntry.isAdjustingEntry
                })
                .eq('id', journalEntry.id);

            if (entryError) {
                console.error('Error updating journal entry:', entryError);
                throw new Error(`Failed to update journal entry: ${entryError.message}`);
            }

            // Delete existing lines
            const { error: deleteError } = await this.supabase
                .from('journal_entry_lines')
                .delete()
                .eq('journal_entry_id', journalEntry.id);

            if (deleteError) {
                console.error('Error deleting journal entry lines:', deleteError);
                throw new Error(`Failed to delete journal entry lines: ${deleteError.message}`);
            }

            // Insert new lines
            const linesData = journalEntry.lines.map(line => ({
                journal_entry_id: journalEntry.id,
                account_id: line.accountId,
                type: line.type,
                amount: line.amount
            }));

            const { error: linesError } = await this.supabase
                .from('journal_entry_lines')
                .insert(linesData);

            if (linesError) {
                console.error('Error updating journal entry lines:', linesError);
                throw new Error(`Failed to update journal entry lines: ${linesError.message}`);
            }

            // Return the updated journal entry
            return await this.findById(journalEntry.id) || journalEntry;
        } catch (error) {
            console.error('Error in update:', error);
            throw error;
        }
    }

    async delete(id: string): Promise<void> {
        try {
            // Delete journal entry lines first (due to foreign key constraint)
            const { error: linesError } = await this.supabase
                .from('journal_entry_lines')
                .delete()
                .eq('journal_entry_id', id);

            if (linesError) {
                console.error('Error deleting journal entry lines:', linesError);
                throw new Error(`Failed to delete journal entry lines: ${linesError.message}`);
            }

            // Delete the journal entry
            const { error: entryError } = await this.supabase
                .from('journal_entries')
                .delete()
                .eq('id', id);

            if (entryError) {
                console.error('Error deleting journal entry:', entryError);
                throw new Error(`Failed to delete journal entry: ${entryError.message}`);
            }
        } catch (error) {
            console.error('Error in delete:', error);
            throw error;
        }
    }

    async findAll(): Promise<JournalEntry[]> {
        try {
            const { data, error } = await this.supabase
                .from('journal_entries')
                .select(`
                    *,
                    journal_entry_lines(*),
                    documents(original_filename, file_path),
                    accountants(full_name)
                `)
                .order('entry_date', { ascending: false });

            if (error) {
                console.error('Error finding all journal entries:', error);
                return [];
            }

            return data?.map(this.mapToJournalEntry) || [];
        } catch (error) {
            console.error('Error in findAll:', error);
            return [];
        }
    }

    async findAdjustingEntries(companyId: string): Promise<JournalEntry[]> {
        try {
            const { data, error } = await this.supabase
                .from('journal_entries')
                .select(`
                    *,
                    journal_entry_lines(*),
                    documents(original_filename, file_path),
                    accountants(full_name)
                `)
                .eq('company_id', companyId)
                .eq('is_adjusting_entry', true)
                .order('entry_date', { ascending: false });

            if (error) {
                console.error('Error finding adjusting entries:', error);
                return [];
            }

            return data?.map(this.mapToJournalEntry) || [];
        } catch (error) {
            console.error('Error in findAdjustingEntries:', error);
            return [];
        }
    }

    async getTrialBalance(companyId: string, asOfDate: Date): Promise<TrialBalance> {
        try {
            // Get all accounts for the company
            const { data: accounts, error: accountsError } = await this.supabase
                .from('company_coa')
                .select('id, account_name, account_type')
                .eq('company_id', companyId);

            if (accountsError) {
                console.error('Error fetching accounts for trial balance:', accountsError);
                throw new Error(`Failed to fetch accounts: ${accountsError.message}`);
            }

            // Get all journal entries up to the asOfDate
            const { data: entries, error: entriesError } = await this.supabase
                .from('journal_entries')
                .select(`
                    id,
                    journal_entry_lines(account_id, type, amount)
                `)
                .eq('company_id', companyId)
                .lte('entry_date', asOfDate.toISOString().split('T')[0]);

            if (entriesError) {
                console.error('Error fetching journal entries for trial balance:', entriesError);
                throw new Error(`Failed to fetch journal entries: ${entriesError.message}`);
            }

            // Calculate trial balance
            const trialBalanceEntries: TrialBalanceEntry[] = accounts?.map(account => {
                let totalDebits = 0;
                let totalCredits = 0;

                // Calculate totals for this account
                entries?.forEach(entry => {
                    entry.journal_entry_lines?.forEach(line => {
                        if (line.account_id === account.id) {
                            if (line.type === 'DEBIT') {
                                totalDebits += parseFloat(line.amount.toString());
                            } else if (line.type === 'CREDIT') {
                                totalCredits += parseFloat(line.amount.toString());
                            }
                        }
                    });
                });

                const balance = totalDebits - totalCredits;

                return {
                    accountId: account.id,
                    accountName: account.account_name,
                    accountType: account.account_type,
                    totalDebits,
                    totalCredits,
                    balance
                };
            }) || [];

            const totalDebits = trialBalanceEntries.reduce((sum, entry) => sum + entry.totalDebits, 0);
            const totalCredits = trialBalanceEntries.reduce((sum, entry) => sum + entry.totalCredits, 0);

            return {
                entries: trialBalanceEntries,
                totalDebits,
                totalCredits,
                isBalanced: Math.abs(totalDebits - totalCredits) < 0.01 // Allow for small rounding differences
            };
        } catch (error) {
            console.error('Error in getTrialBalance:', error);
            throw error;
        }
    }

    private mapToJournalEntry(data: JournalEntryData): JournalEntry {
        const lines = data.journal_entry_lines?.map((line: JournalEntryLineData) =>
            new JournalEntryLine({
                id: line.id,
                journalEntryId: line.journal_entry_id,
                accountId: line.account_id,
                type: line.type,
                amount: line.amount
            })
        ) || [];

        return new JournalEntry({
            id: data.id,
            companyId: data.company_id,
            entryDate: new Date(data.entry_date),
            description: data.description,
            createdByAccountantId: data.created_by_accountant_id,
            sourceDocumentId: data.source_document_id,
            isAdjustingEntry: data.is_adjusting_entry,
            createdAt: new Date(data.created_at),
            lines
        });
    }
} 