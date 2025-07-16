import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { useToast } from '@/shared/hooks/useToast';
import { DocumentActionButtons } from '@/shared/components/DocumentActionButtons';
import { DocumentPreview } from '@/shared/components/DocumentPreview';
import { CommentPanel } from '@/shared/components/CommentPanel';
import {
    Search,
    Building,
    Calendar,
    FileText,
    MoreVertical,
    ArrowLeft,
    Download,
    Users
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/components/DropdownMenu';
import { getMyClientCompanies } from '@/shared/services/supabase/company';
import { getBankStatementsByCompanyId, downloadDocumentsAsZip } from '@/shared/services/supabase/document';
import { Document } from '@/shared/types/document';

interface Company {
    id: string;
    name: string;
    type: string;
    is_active: boolean;
    created_at: string;
    user_id: string;
}

export default function AccountantClients() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [clients, setClients] = useState<Company[]>([]);
    const [selectedClient, setSelectedClient] = useState<Company | null>(null);
    const [bankStatements, setBankStatements] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isBankStatementsLoading, setIsBankStatementsLoading] = useState(false);
    const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
    const [commentDocument, setCommentDocument] = useState<Document | null>(null);
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
                                {bankStatements.length} statements
                            </p>
                        </div>
                    </div>
                    {bankStatements.length > 0 && (
                        <Button onClick={handleDownloadAll}>
                            <Download className="w-4 h-4 mr-2" />
                            Download All as ZIP
                        </Button>
                    )}
                </div>

                {/* Bank Statements List */}
                <Card>
                    <CardContent className="p-6">
                        {isBankStatementsLoading ? (
                            <div className="text-center py-8">
                                <div className="text-gray-500">Loading bank statements...</div>
                            </div>
                        ) : bankStatements.length === 0 ? (
                            <div className="text-center py-8">
                                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No bank statements</h3>
                                <p className="text-gray-600">This client hasn't uploaded any bank statements yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {bankStatements.map((statement) => (
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
                                                document={statement}
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
            {filteredClients.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
                        <p className="text-gray-600">
                            {clients.length === 0
                                ? "You don't have any assigned clients yet."
                                : "No clients match your search criteria."
                            }
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredClients.map((client) => (
                        <Card key={client.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Building className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{client.name}</CardTitle>
                                            <p className="text-sm text-gray-600 capitalize">{client.type}</p>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleClientSelect(client)}>
                                                View Bank Statements
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>Send Message</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="space-y-2">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Created {new Date(client.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-4">
                                    {getStatusBadge(client.is_active)}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleClientSelect(client)}
                                    >
                                        <FileText className="w-4 h-4 mr-2" />
                                        View Documents
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
} 