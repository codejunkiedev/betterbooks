import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { Label } from '@/shared/components/Label';
import { Textarea } from '@/shared/components/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/Select';
import { useToast } from '@/shared/hooks/useToast';
import { X, Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { Document } from '@/shared/types/document';
import { createJournalEntry } from '@/shared/services/supabase/journal';
import { updateDocumentStatus } from '@/shared/services/supabase/document';
import { getCompanyCOA } from '@/shared/services/supabase/coa';
import { CompanyCOA } from '@/shared/types/coa';
import { supabase } from '@/shared/services/supabase/client';

interface Company {
    id: string;
    name: string;
    type: string;
    is_active: boolean;
    created_at: string;
    user_id: string;
}

interface JournalEntryLine {
    account_id: string;
    type: 'DEBIT' | 'CREDIT';
    amount: number;
}

interface CreateJournalEntryFormProps {
    isOpen: boolean;
    onClose: () => void;
    company: Company;
    document?: Document; // Optional - for document-associated entries
    onSuccess?: () => void;
}

// Group accounts by type for better organization - memoized
const groupAccountsByType = (accounts: CompanyCOA[]) => {
    const grouped = accounts.reduce((acc, account) => {
        const type = account.account_type;
        if (!acc[type]) {
            acc[type] = [];
        }
        acc[type].push(account);
        return acc;
    }, {} as Record<string, CompanyCOA[]>);

    // Sort accounts within each group by account_id
    Object.keys(grouped).forEach(type => {
        grouped[type].sort((a, b) => a.account_id.localeCompare(b.account_id));
    });

    return grouped;
};

export default function CreateJournalEntryForm({
    isOpen,
    onClose,
    company,
    document,
    onSuccess
}: CreateJournalEntryFormProps) {
    const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [lines, setLines] = useState<JournalEntryLine[]>([
        { account_id: '', type: 'DEBIT', amount: 0 },
        { account_id: '', type: 'CREDIT', amount: 0 }
    ]);
    const [accounts, setAccounts] = useState<CompanyCOA[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
    const { toast } = useToast();

    // Determine if this is a document-associated entry
    const isDocumentEntry = !!document;

    useEffect(() => {
        if (isOpen) {
            loadAccounts();

            if (isDocumentEntry && document) {
                // Set default description based on document
                setDescription(`Journal entry for ${document.original_filename}`);
            } else {
                // Reset form for standalone entries
                setEntryDate(new Date().toISOString().split('T')[0]);
                setDescription('');
                setLines([
                    { account_id: '', type: 'DEBIT', amount: 0 },
                    { account_id: '', type: 'CREDIT', amount: 0 }
                ]);
            }
        }
    }, [isOpen, document, isDocumentEntry]);

    const loadAccounts = useCallback(async () => {
        try {
            setIsLoadingAccounts(true);
            const { data, error } = await getCompanyCOA(company.id);
            if (error) throw error;
            setAccounts(data || []);
        } catch (error) {
            console.error('Error loading accounts:', error);
            toast({
                title: 'Error',
                description: 'Failed to load chart of accounts',
                variant: 'destructive',
            });
        } finally {
            setIsLoadingAccounts(false);
        }
    }, [company.id, toast]);

    const addLine = useCallback(() => {
        setLines(prev => [...prev, { account_id: '', type: 'DEBIT', amount: 0 }]);
    }, []);

    const removeLine = useCallback((index: number) => {
        setLines(prev => prev.length > 2 ? prev.filter((_, i) => i !== index) : prev);
    }, []);

    const updateLine = useCallback((index: number, field: keyof JournalEntryLine, value: string | number) => {
        setLines(prev => {
            const newLines = [...prev];
            newLines[index] = { ...newLines[index], [field]: value };
            return newLines;
        });
    }, []);

    // Memoized calculations
    const { totalDebits, totalCredits, isBalanced, difference } = useMemo(() => {
        const totalDebits = lines
            .filter(line => line.type === 'DEBIT')
            .reduce((sum, line) => sum + line.amount, 0);
        const totalCredits = lines
            .filter(line => line.type === 'CREDIT')
            .reduce((sum, line) => sum + line.amount, 0);
        const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;
        const difference = Math.abs(totalDebits - totalCredits);

        return { totalDebits, totalCredits, isBalanced, difference };
    }, [lines]);

    // Memoized grouped accounts
    const groupedAccounts = useMemo(() => groupAccountsByType(accounts), [accounts]);

    const validateForm = useCallback(() => {
        if (!description.trim()) {
            toast({
                title: 'Validation Error',
                description: 'Please enter a description',
                variant: 'destructive',
            });
            return false;
        }

        if (!entryDate) {
            toast({
                title: 'Validation Error',
                description: 'Please select an entry date',
                variant: 'destructive',
            });
            return false;
        }

        // Check if all lines have accounts and amounts
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (!line.account_id) {
                toast({
                    title: 'Validation Error',
                    description: `Please select an account for line ${i + 1}`,
                    variant: 'destructive',
                });
                return false;
            }
            if (line.amount <= 0) {
                toast({
                    title: 'Validation Error',
                    description: `Please enter a valid amount for line ${i + 1}`,
                    variant: 'destructive',
                });
                return false;
            }
        }

        if (!isBalanced) {
            toast({
                title: 'Validation Error',
                description: 'Total debits must equal total credits',
                variant: 'destructive',
            });
            return false;
        }

        return true;
    }, [description, entryDate, lines, isBalanced, toast]);

    const handleSubmit = useCallback(async () => {
        if (!validateForm()) return;

        try {
            setIsLoading(true);

            // Get current accountant ID
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { data: accountant, error: accountantError } = await supabase
                .from('accountants')
                .select('id')
                .eq('user_id', user.id)
                .eq('is_active', true)
                .maybeSingle();

            if (accountantError || !accountant) {
                throw new Error('Accountant record not found');
            }

            // Create journal entry
            const journalEntryData = {
                company_id: company.id,
                entry_date: entryDate,
                description: description,
                created_by: accountant.id,
                is_adjusting_entry: false,
                lines: lines,
                ...(document?.id && { source_document_id: document.id })
            };

            await createJournalEntry(journalEntryData);

            // Update document status if this is a document-associated entry
            if (isDocumentEntry && document) {
                try {
                    await updateDocumentStatus({
                        document_id: document.id,
                        status: 'COMPLETED'
                    });
                } catch (statusError) {
                    console.error('Error updating document status:', statusError);
                    // Don't fail the entire operation, but log the error
                    // The journal entry was created successfully
                }
            }

            toast({
                title: 'Success',
                description: isDocumentEntry
                    ? 'Journal entry created and document marked as completed'
                    : 'Journal entry created successfully',
            });

            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Error creating journal entry:', error);
            toast({
                title: 'Error',
                description: 'Failed to create journal entry',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    }, [validateForm, company.id, entryDate, description, lines, document, isDocumentEntry, onSuccess, onClose, toast]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Create Journal Entry</CardTitle>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                    <p className="text-sm text-gray-600">
                        {isDocumentEntry
                            ? `Creating journal entry for: ${document?.original_filename}`
                            : `Creating journal entry for: ${company.name}`
                        }
                    </p>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="entryDate">Entry Date</Label>
                            <Input
                                id="entryDate"
                                type="date"
                                value={entryDate}
                                onChange={(e) => setEntryDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter journal entry description"
                            />
                        </div>
                    </div>

                    {/* Journal Entry Lines */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <Label>Journal Entry Lines</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addLine}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Line
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {lines.map((line, index) => (
                                <div key={index} className="grid grid-cols-12 gap-3 items-center">
                                    <div className="col-span-5">
                                        <Select
                                            value={line.account_id}
                                            onValueChange={(value) => updateLine(index, 'account_id', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select account" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {isLoadingAccounts ? (
                                                    <SelectItem value="loading" disabled>
                                                        Loading accounts...
                                                    </SelectItem>
                                                ) : (
                                                    <>
                                                        <SelectItem value="placeholder" disabled>
                                                            Select an account
                                                        </SelectItem>
                                                        {Object.entries(groupedAccounts).map(([type, typeAccounts]) => (
                                                            <div key={type}>
                                                                <div className="px-2 py-1.5 text-sm font-medium text-gray-500 bg-gray-100">
                                                                    {type}
                                                                </div>
                                                                {typeAccounts.map((account) => (
                                                                    <SelectItem key={account.id} value={account.id.toString()}>
                                                                        {account.account_id} - {account.account_name}
                                                                    </SelectItem>
                                                                ))}
                                                            </div>
                                                        ))}
                                                    </>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="col-span-3">
                                        <Select
                                            value={line.type}
                                            onValueChange={(value: 'DEBIT' | 'CREDIT') => updateLine(index, 'type', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="DEBIT">Debit</SelectItem>
                                                <SelectItem value="CREDIT">Credit</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="col-span-3">
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={line.amount}
                                            onChange={(e) => updateLine(index, 'amount', parseFloat(e.target.value) || 0)}
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        {lines.length > 2 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeLine(index)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-medium">Total Debits:</span>
                                    <span className="ml-2">${totalDebits.toFixed(2)}</span>
                                </div>
                                <div>
                                    <span className="font-medium">Total Credits:</span>
                                    <span className="ml-2">${totalCredits.toFixed(2)}</span>
                                </div>
                            </div>
                            <div className={`mt-2 flex items-center gap-2 text-sm ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                                {isBalanced ? (
                                    <>
                                        <CheckCircle className="w-4 h-4" />
                                        <span>✓ Balanced</span>
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle className="w-4 h-4" />
                                        <span>✗ Not Balanced (Difference: ${difference.toFixed(2)})</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={isLoading || !isBalanced}>
                            {isLoading ? 'Creating...' : 'Create Journal Entry'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 