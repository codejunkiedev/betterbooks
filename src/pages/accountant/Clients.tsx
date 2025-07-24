import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { useToast } from '@/shared/hooks/useToast';
import {
    Search
} from 'lucide-react';
import { getMyClientCompanies } from '@/shared/services/supabase/company';
import { getBankStatementsByCompanyId, downloadDocumentsAsZip } from '@/shared/services/supabase/document';
import { Document } from '@/shared/types/document';
import SelectedClient from '@/features/accountant/text-documents/SelectedClient';
import Clients from '@/features/accountant/clients/Clients';

interface Company {
    id: string;
    name: string;
    type: string;
    is_active: boolean;
    created_at: string;
    user_id: string;
}

export default function AccountantClients() {
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [clients, setClients] = useState<Company[]>([]);
    const [selectedClient, setSelectedClient] = useState<Company | null>(null);
    const [bankStatements, setBankStatements] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isBankStatementsLoading, setIsBankStatementsLoading] = useState(false);
    const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
    const [commentDocument, setCommentDocument] = useState<Document | null>(null);
    const [journalEntryDocument, setJournalEntryDocument] = useState<Document | null>(null);
    const { toast } = useToast();

    const loadClients = useCallback(async () => {
        try {
            setIsLoading(true);
            const companies = await getMyClientCompanies();
            setClients(companies || []);
        } catch (error) {
            console.error('Error loading clients:', error);
            toast({
                title: 'Error',
                description: 'Failed to load clients',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadClients();
    }, [loadClients]);

    // Handle selected client from dashboard navigation
    useEffect(() => {
        if (location.state?.selectedClientId && clients.length > 0) {
            const client = clients.find(c => c.id === location.state.selectedClientId);
            if (client) {
                handleClientSelect(client);
            }
        }
    }, [location.state?.selectedClientId, clients]);

    const loadBankStatements = async (companyId: string) => {
        try {
            setIsBankStatementsLoading(true);
            const { data, error } = await getBankStatementsByCompanyId(companyId);

            if (error) {
                throw error;
            }

            setBankStatements(data || []);
        } catch (error) {
            console.error('Error loading bank statements:', error);
            toast({
                title: 'Error',
                description: 'Failed to load bank statements',
                variant: 'destructive',
            });
        } finally {
            setIsBankStatementsLoading(false);
        }
    };

    const handleClientSelect = (client: Company) => {
        setSelectedClient(client);
        loadBankStatements(client.id);
    };

    const handleBackToClients = () => {
        setSelectedClient(null);
        setBankStatements([]);
        setPreviewDocument(null);
    };

    const handleDownloadAll = async () => {
        if (bankStatements.length === 0) {
            toast({
                title: 'No documents',
                description: 'No bank statements available to download',
                variant: 'destructive',
            });
            return;
        }

        try {
            const fileName = `${selectedClient?.name}_bank_statements.zip`;
            await downloadDocumentsAsZip(bankStatements, fileName);
            toast({
                title: 'Download started',
                description: 'Bank statements are being downloaded as ZIP file',
            });
        } catch (error) {
            console.error('Error downloading ZIP:', error);
            toast({
                title: 'Download failed',
                description: 'Failed to download bank statements as ZIP',
                variant: 'destructive',
            });
        }
    };

    const handlePreviewDocument = (document: Document) => {
        setPreviewDocument(document);
    };

    const handleCommentsDocument = (document: Document) => {
        setCommentDocument(document);
    };

    const handleCreateJournalEntry = (document: Document) => {
        setJournalEntryDocument(document);
    };

    const getStatusBadge = (isActive: boolean) => {
        return isActive ?
            <Badge className="bg-green-100 text-green-800">Active</Badge> :
            <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
    };

    const filteredClients = clients.filter(client => {
        const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'active' && client.is_active) ||
            (statusFilter === 'inactive' && !client.is_active);
        return matchesSearch && matchesStatus;
    });

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-center py-12">
                    <div className="text-gray-500">Loading clients...</div>
                </div>
            </div>
        );
    }

    // Bank Statements View
    if (selectedClient) {
        return (
            <SelectedClient
                selectedClient={selectedClient}
                bankStatements={bankStatements}
                isBankStatementsLoading={isBankStatementsLoading}
                handleBackToClients={handleBackToClients}
                handleDownloadAll={handleDownloadAll}
                handlePreviewDocument={handlePreviewDocument}
                handleCommentsDocument={handleCommentsDocument}
                handleCreateJournalEntry={handleCreateJournalEntry}
                previewDocument={previewDocument}
                setPreviewDocument={setPreviewDocument}
                commentDocument={commentDocument}
                setCommentDocument={setCommentDocument}
                journalEntryDocument={journalEntryDocument}
                setJournalEntryDocument={setJournalEntryDocument}
            />
        );
    }

    // Clients List View
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
                    <p className="text-gray-600">Manage your client accounts and view their documents</p>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Search clients..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={statusFilter === 'all' ? 'default' : 'outline'}
                                onClick={() => setStatusFilter('all')}
                                size="sm"
                            >
                                All
                            </Button>
                            <Button
                                variant={statusFilter === 'active' ? 'default' : 'outline'}
                                onClick={() => setStatusFilter('active')}
                                size="sm"
                            >
                                Active
                            </Button>
                            <Button
                                variant={statusFilter === 'inactive' ? 'default' : 'outline'}
                                onClick={() => setStatusFilter('inactive')}
                                size="sm"
                            >
                                Inactive
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Clients Grid */}
            <Clients
                filteredClients={filteredClients}
                clients={clients}
                handleClientSelect={handleClientSelect}
                handleDownloadAll={handleDownloadAll}
                getStatusBadge={getStatusBadge}
            />
        </div>
    );
} 