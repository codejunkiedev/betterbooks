import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';
import { useToast } from '@/shared/hooks/useToast';
import { getPaginatedAccountantClients, updateCompanyStatus } from '@/shared/services/supabase/company';
import { getBankStatementsByCompanyId, downloadDocumentsAsZip } from '@/shared/services/supabase/document';
import { Document } from '@/shared/types/document';
import SelectedClient from '@/features/accountant/text-documents/SelectedClient';
import { Clients, ClientFilters } from '@/features/accountant/clients';

interface Company {
    id: string;
    name: string;
    type: string;
    is_active: boolean;
    created_at: string;
    user_id: string;
}

const ITEMS_PER_PAGE = 12;

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
    const [askUserDocument, setAskUserDocument] = useState<Document | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const { toast } = useToast();

    const loadClients = useCallback(async () => {
        try {
            setIsLoading(true);

            const filters: {
                search?: string;
                status?: 'all' | 'active' | 'inactive';
            } = {};

            if (searchTerm) {
                filters.search = searchTerm;
            }

            if (statusFilter !== 'all') {
                filters.status = statusFilter as 'active' | 'inactive';
            }

            const { data, error } = await getPaginatedAccountantClients(currentPage, ITEMS_PER_PAGE, filters);

            if (error) throw error;

            if (data) {
                setClients(data.items);
                setTotalItems(data.total);
            }
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
    }, [currentPage, searchTerm, statusFilter, toast]);

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

    const handleAskUser = (document: Document) => {
        setAskUserDocument(document);
    };

    const getStatusBadge = (isActive: boolean) => {
        return isActive ?
            <Badge className="bg-green-100 text-green-800">Active</Badge> :
            <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1); // Reset to first page when search changes
    };

    const handleStatusFilterChange = (value: string) => {
        setStatusFilter(value);
        setCurrentPage(1); // Reset to first page when filter changes
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setCurrentPage(1);
    };

    const handleStatusToggle = async (clientId: string, isActive: boolean) => {
        try {
            await updateCompanyStatus(clientId, isActive);

            // Update the local state
            setClients(prevClients =>
                prevClients.map(client =>
                    client.id === clientId
                        ? { ...client, is_active: isActive }
                        : client
                )
            );

            toast({
                title: 'Success',
                description: `Client ${isActive ? 'activated' : 'deactivated'} successfully`,
            });
        } catch (error) {
            console.error('Error updating client status:', error);
            toast({
                title: 'Error',
                description: 'Failed to update client status',
                variant: 'destructive',
            });
        }
    };

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
                handleAskUser={handleAskUser}
                previewDocument={previewDocument}
                setPreviewDocument={setPreviewDocument}
                commentDocument={commentDocument}
                setCommentDocument={setCommentDocument}
                journalEntryDocument={journalEntryDocument}
                setJournalEntryDocument={setJournalEntryDocument}
                askUserDocument={askUserDocument}
                setAskUserDocument={setAskUserDocument}
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
            <ClientFilters
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                statusFilter={statusFilter}
                onStatusFilterChange={handleStatusFilterChange}
                onClearFilters={handleClearFilters}
                totalResults={totalItems}
            />

            {/* Clients Grid */}
            <Clients
                filteredClients={clients}
                clients={clients}
                handleClientSelect={handleClientSelect}
                handleDownloadAll={handleDownloadAll}
                getStatusBadge={getStatusBadge}
                onStatusToggle={handleStatusToggle}
            />

            {/* Pagination */}
            {totalItems > ITEMS_PER_PAGE && (
                <div className="flex items-center justify-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                        Page {currentPage} of {Math.ceil(totalItems / ITEMS_PER_PAGE)}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= Math.ceil(totalItems / ITEMS_PER_PAGE)}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
} 