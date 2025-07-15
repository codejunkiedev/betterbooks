import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { useToast } from '@/shared/hooks/useToast';
import { DocumentActionButtons } from '@/shared/components/DocumentActionButtons';
import { DocumentPreview } from '@/shared/components/DocumentPreview';
import {
    Search,
    Building,
    FileText,
    ArrowLeft,
    Download,
    Users,
    Clock
} from 'lucide-react';
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

interface ClientWithStatements extends Company {
    bankStatements: Document[];
    statementsCount: number;
    lastUpload?: string;
}

export default function BankStatements() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState<ClientWithStatements | null>(null);
    const [clients, setClients] = useState<ClientWithStatements[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
    const { toast } = useToast();

    const loadClientsWithBankStatements = useCallback(async () => {
        try {
            setIsLoading(true);
            const companies = await getMyClientCompanies();

            // Load bank statements for each client
            const clientsWithStatements = await Promise.all(
                (companies || []).map(async (company) => {
                    const { data: statements } = await getBankStatementsByCompanyId(company.id);
                    const bankStatements = statements || [];

                    return {
                        ...company,
                        bankStatements,
                        statementsCount: bankStatements.length,
                        lastUpload: bankStatements.length > 0
                            ? bankStatements[0].uploaded_at
                            : undefined
                    };
                })
            );

            setClients(clientsWithStatements);
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
    }, [toast]);

    useEffect(() => {
        loadClientsWithBankStatements();
    }, [loadClientsWithBankStatements]);

    const handleClientSelect = (client: ClientWithStatements) => {
        setSelectedClient(client);
    };

    const handleBackToClients = () => {
        setSelectedClient(null);
        setPreviewDocument(null);
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

    const filteredClients = clients.filter(client => {
        const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

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
                        <Button onClick={() => handleDownloadAll(selectedClient.bankStatements, selectedClient.name)}>
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
                                                document={statement}
                                                onPreview={handlePreviewDocument}
                                                showPreview={true}
                                                showDownload={true}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                                <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Clients with Statements</p>
                                <p className="text-2xl font-bold text-gray-900">{clientsWithStatements}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <Building className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Statements</p>
                                <p className="text-2xl font-bold text-gray-900">{totalStatements}</p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-full">
                                <FileText className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
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
                    </div>
                </CardContent>
            </Card>

            {/* Clients List */}
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
                                    <Badge
                                        className={client.statementsCount > 0
                                            ? "bg-green-100 text-green-800"
                                            : "bg-gray-100 text-gray-800"
                                        }
                                    >
                                        {client.statementsCount} statements
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Clock className="w-4 h-4 mr-2" />
                                        {client.lastUpload
                                            ? `Last upload: ${new Date(client.lastUpload).toLocaleDateString()}`
                                            : 'No uploads yet'
                                        }
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleClientSelect(client)}
                                    >
                                        <FileText className="w-4 h-4 mr-2" />
                                        View Statements
                                    </Button>
                                    {client.statementsCount > 0 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDownloadAll(client.bankStatements, client.name)}
                                        >
                                            <Download className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
} 