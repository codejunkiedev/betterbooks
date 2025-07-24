import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';
import { useToast } from '@/shared/hooks/useToast';
import { DocumentActionButtons } from '@/shared/components/DocumentActionButtons';
import { DocumentPreview } from '@/shared/components/DocumentPreview';
import { CommentPanel } from '@/shared/components/CommentPanel';
import {
    FileText,
    ArrowLeft,
    Download,
} from 'lucide-react';
import { getPaginatedBankStatementClients } from '@/shared/services/supabase/company';
import { downloadDocumentsAsZip } from '@/shared/services/supabase/document';
import { Document } from '@/shared/types/document';
import { StatsCards, BankStatementFilters, ClientsList } from '@/features/accountant/bank-statments';

interface Company {
    id: string;
    name: string;
    type: string;
    is_active: boolean;
    created_at: string;
    user_id: string;
}

interface ClientWithStatements extends Company {
    bankStatements: Array<{
        id: string;
        original_filename: string;
        uploaded_at: string;
        status: string;
    }>;
    statementsCount: number;
    lastUpload?: string;
}

const ITEMS_PER_PAGE = 12;

export default function BankStatements() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedClient, setSelectedClient] = useState<ClientWithStatements | null>(null);
    const [clients, setClients] = useState<ClientWithStatements[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
    const [commentDocument, setCommentDocument] = useState<Document | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const { toast } = useToast();

    const loadClientsWithBankStatements = useCallback(async () => {
        try {
            setIsLoading(true);

            const filters: {
                search?: string;
                status?: 'all' | 'with_statements' | 'without_statements';
            } = {};

            if (searchTerm) {
                filters.search = searchTerm;
            }

            if (statusFilter !== 'all') {
                filters.status = statusFilter as 'with_statements' | 'without_statements';
            }

            const { data, error } = await getPaginatedBankStatementClients(currentPage, ITEMS_PER_PAGE, filters);

            if (error) throw error;

            if (data) {
                setClients(data.items);
                setTotalItems(data.total);
            }
        } catch (error) {
            console.error('Error loading clients with bank statements:', error);
            toast({
                title: 'Error',
                description: 'Failed to load client bank statements',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, searchTerm, statusFilter, toast]);

    useEffect(() => {
        loadClientsWithBankStatements();
    }, [loadClientsWithBankStatements]);

    const handleClientSelect = (client: ClientWithStatements) => {
        setSelectedClient(client);
    };

    const handleBackToClients = () => {
        setSelectedClient(null);
        setPreviewDocument(null);
        setCommentDocument(null);
    };

    const handleDownloadAll = async (statements: Document[], clientName: string) => {
        if (statements.length === 0) {
            toast({
                title: 'No documents',
                description: 'No bank statements available to download',
                variant: 'destructive',
            });
            return;
        }

        try {
            const fileName = `${clientName}_bank_statements.zip`;
            await downloadDocumentsAsZip(statements, fileName);
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

    const totalStatements = clients.reduce((sum, client) => sum + client.statementsCount, 0);
    const clientsWithStatements = clients.filter(client => client.statementsCount > 0).length;

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-center py-12">
                    <div className="text-gray-500">Loading bank statements...</div>
                </div>
            </div>
        );
    }

    // Individual Client Bank Statements View
    if (selectedClient) {
        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={handleBackToClients} className="p-2">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {selectedClient.name} - Bank Statements
                            </h1>
                            <p className="text-gray-600">
                                {selectedClient.statementsCount} statements
                            </p>
                        </div>
                    </div>
                    {selectedClient.statementsCount > 0 && (
                        <Button onClick={() => handleDownloadAll(selectedClient.bankStatements as Document[], selectedClient.name)}>
                            <Download className="w-4 h-4 mr-2" />
                            Download All as ZIP
                        </Button>
                    )}
                </div>

                {/* Bank Statements List */}
                <Card>
                    <CardContent className="p-6">
                        {selectedClient.statementsCount === 0 ? (
                            <div className="text-center py-8">
                                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No bank statements</h3>
                                <p className="text-gray-600">This client hasn't uploaded any bank statements yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {selectedClient.bankStatements.map((statement) => (
                                    <div key={statement.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <FileText className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900">{statement.original_filename}</h4>
                                                <p className="text-sm text-gray-600">
                                                    Uploaded on {new Date(statement.uploaded_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge className="bg-yellow-100 text-yellow-800 capitalize">
                                                {statement.status.replace('_', ' ').toLowerCase()}
                                            </Badge>
                                            <DocumentActionButtons
                                                document={statement as Document}
                                                onPreview={handlePreviewDocument}
                                                onComments={handleCommentsDocument}
                                                showPreview={true}
                                                showDownload={true}
                                                showComments={true}
                                                size="sm"
                                                variant="ghost"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Document Preview Modal */}
                {previewDocument && (
                    <DocumentPreview
                        document={previewDocument}
                        isOpen={!!previewDocument}
                        onClose={() => setPreviewDocument(null)}
                    />
                )}

                {/* Comment Panel */}
                {commentDocument && (
                    <CommentPanel
                        isOpen={!!commentDocument}
                        onClose={() => setCommentDocument(null)}
                        documentId={commentDocument.id}
                        documentName={commentDocument.original_filename}
                    />
                )}
            </div>
        );
    }

    // Main Bank Statements Overview
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Bank Statements</h1>
                    <p className="text-gray-600">Manage and review client bank statements</p>
                </div>
            </div>

            {/* Stats Cards */}
            <StatsCards
                clientsLength={totalItems}
                clientsWithStatements={clientsWithStatements}
                totalStatements={totalStatements}
            />

            {/* Search and Filters */}
            <BankStatementFilters
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                statusFilter={statusFilter}
                onStatusFilterChange={handleStatusFilterChange}
                onClearFilters={handleClearFilters}
                totalResults={totalItems}
            />

            {/* Clients List */}
            <ClientsList
                filteredClients={clients}
                clients={clients}
                handleClientSelect={handleClientSelect}
                handleDownloadAll={handleDownloadAll}
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