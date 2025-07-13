import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { PageSkeleton } from "@/components/ui/loading";
import { FileText, Eye, MessageSquare, Download, Search, Plus, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Document {
    id: string;
    original_filename: string;
    file_path: string;
    status: 'PENDING_REVIEW' | 'IN_PROGRESS' | 'USER_INPUT_NEEDED' | 'COMPLETED';
    type: 'INVOICE' | 'RECEIPT' | 'BANK_STATEMENT' | 'OTHER';
    uploaded_at: string;
    company_name: string;
    company_id: string;
    uploaded_by_name: string;
}

interface CompanyData {
    name: string;
}

interface ProfileData {
    full_name: string;
}

interface DocumentData {
    id: string;
    original_filename: string;
    file_path: string;
    status: string;
    type: string;
    uploaded_at: string;
    company_id: string;
    companies: CompanyData | CompanyData[] | null;
    profiles: ProfileData | ProfileData[] | null;
}

const AccountantDocuments = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [clientFilter, setClientFilter] = useState("all");
    const [clients, setClients] = useState<{ id: string, name: string }[]>([]);
    const { user } = useAuth();
    const { toast } = useToast();

    const loadDocuments = useCallback(async () => {
        if (!user) return;

        try {
            setIsLoading(true);

            // First, get assigned clients
            const { data: clientsData, error: clientsError } = await supabase
                .from('companies')
                .select('id, name')
                .eq('assigned_accountant_id', user.id)
                .eq('is_active', true);

            if (clientsError) throw clientsError;

            setClients(clientsData || []);

            if (clientsData && clientsData.length > 0) {
                const clientIds = clientsData.map(client => client.id);

                // Fetch documents from assigned clients
                const { data: documentsData, error: documentsError } = await supabase
                    .from('documents')
                    .select(`
            id,
            original_filename,
            file_path,
            status,
            type,
            uploaded_at,
            company_id,
            companies!inner(name),
            profiles!documents_uploaded_by_user_id_fkey(full_name)
          `)
                    .in('company_id', clientIds)
                    .order('uploaded_at', { ascending: false });

                if (documentsError) throw documentsError;

                const processedDocuments = (documentsData as DocumentData[])?.map(doc => {
                    let company_name = '';
                    if (doc.companies) {
                        if (Array.isArray(doc.companies) && doc.companies.length > 0) {
                            company_name = doc.companies[0].name;
                        } else if ((doc.companies as CompanyData)?.name) {
                            company_name = (doc.companies as CompanyData).name;
                        }
                    }
                    let uploaded_by_name = 'Unknown';
                    if (doc.profiles) {
                        if (Array.isArray(doc.profiles) && doc.profiles.length > 0) {
                            uploaded_by_name = doc.profiles[0].full_name;
                        } else if ((doc.profiles as ProfileData)?.full_name) {
                            uploaded_by_name = (doc.profiles as ProfileData).full_name;
                        }
                    }
                    return {
                        id: doc.id,
                        original_filename: doc.original_filename,
                        file_path: doc.file_path,
                        status: doc.status as 'PENDING_REVIEW' | 'IN_PROGRESS' | 'USER_INPUT_NEEDED' | 'COMPLETED',
                        type: doc.type as 'INVOICE' | 'RECEIPT' | 'BANK_STATEMENT' | 'OTHER',
                        uploaded_at: doc.uploaded_at,
                        company_name,
                        company_id: doc.company_id,
                        uploaded_by_name
                    };
                }) || [];

                setDocuments(processedDocuments);
                setFilteredDocuments(processedDocuments);
            } else {
                setDocuments([]);
                setFilteredDocuments([]);
            }

        } catch (error) {
            console.error("Error loading documents:", error);
            toast({
                title: "Error",
                description: "Failed to load documents. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [user, toast]);

    useEffect(() => {
        loadDocuments();
    }, [loadDocuments]);

    // Filter documents based on search and filters
    useEffect(() => {
        let filtered = documents;

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(doc =>
                doc.original_filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.uploaded_by_name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply status filter
        if (statusFilter !== "all") {
            filtered = filtered.filter(doc => doc.status === statusFilter);
        }

        // Apply type filter
        if (typeFilter !== "all") {
            filtered = filtered.filter(doc => doc.type === typeFilter);
        }

        // Apply client filter
        if (clientFilter !== "all") {
            filtered = filtered.filter(doc => doc.company_id === clientFilter);
        }

        setFilteredDocuments(filtered);
    }, [documents, searchTerm, statusFilter, typeFilter, clientFilter]);

    const handleViewDocument = (documentId: string) => {
        window.location.href = `/accountant/documents/${documentId}`;
    };

    const handleCreateJournalEntry = (documentId: string) => {
        window.location.href = `/accountant/journal/create?document=${documentId}`;
    };

    const handleMessageClient = (companyId: string) => {
        window.location.href = `/accountant/messages?company=${companyId}`;
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'PENDING_REVIEW':
                return "destructive";
            case 'IN_PROGRESS':
                return "default";
            case 'USER_INPUT_NEEDED':
                return "secondary";
            case 'COMPLETED':
                return "outline";
            default:
                return "outline";
        }
    };

    const getTypeBadgeVariant = (type: string) => {
        switch (type) {
            case 'INVOICE':
                return "default";
            case 'RECEIPT':
                return "secondary";
            case 'BANK_STATEMENT':
                return "outline";
            default:
                return "outline";
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING_REVIEW':
                return <Clock className="w-4 h-4" />;
            case 'IN_PROGRESS':
                return <AlertCircle className="w-4 h-4" />;
            case 'USER_INPUT_NEEDED':
                return <MessageSquare className="w-4 h-4" />;
            case 'COMPLETED':
                return <CheckCircle className="w-4 h-4" />;
            default:
                return <FileText className="w-4 h-4" />;
        }
    };

    if (isLoading) {
        return <PageSkeleton />;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Document Management</h1>
                        <p className="text-gray-600 mt-2">Process and manage client documents</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Export List
                        </Button>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Journal Entry
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div className="lg:col-span-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        placeholder="Search documents..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="PENDING_REVIEW">Pending Review</SelectItem>
                                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                    <SelectItem value="USER_INPUT_NEEDED">User Input Needed</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="INVOICE">Invoices</SelectItem>
                                    <SelectItem value="RECEIPT">Receipts</SelectItem>
                                    <SelectItem value="BANK_STATEMENT">Bank Statements</SelectItem>
                                    <SelectItem value="OTHER">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={clientFilter} onValueChange={setClientFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by client" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Clients</SelectItem>
                                    {clients.map(client => (
                                        <SelectItem key={client.id} value={client.id}>
                                            {client.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Documents Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDocuments.map((document) => (
                        <Card key={document.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 min-w-0">
                                        <CardTitle className="text-lg truncate">{document.original_filename}</CardTitle>
                                        <CardDescription className="truncate">{document.company_name}</CardDescription>
                                    </div>
                                    <div className="flex gap-1">
                                        <Badge variant={getStatusBadgeVariant(document.status)}>
                                            {getStatusIcon(document.status)}
                                        </Badge>
                                        <Badge variant={getTypeBadgeVariant(document.type)}>
                                            {document.type.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Document Info */}
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Uploaded by</span>
                                        <span className="text-sm text-gray-900">{document.uploaded_by_name}</span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Uploaded</span>
                                        <span className="text-sm text-gray-900">{formatDate(document.uploaded_at)}</span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleViewDocument(document.id)}
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            View
                                        </Button>
                                        {document.status === 'PENDING_REVIEW' && (
                                            <Button
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => handleCreateJournalEntry(document.id)}
                                            >
                                                <Plus className="w-4 h-4 mr-1" />
                                                Process
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleMessageClient(document.company_id)}
                                        >
                                            <MessageSquare className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Empty State */}
                {filteredDocuments.length === 0 && (
                    <Card className="text-center py-12">
                        <CardContent>
                            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {searchTerm || statusFilter !== "all" || typeFilter !== "all" || clientFilter !== "all"
                                    ? "No documents found"
                                    : "No documents available"}
                            </h3>
                            <p className="text-gray-500 mb-4">
                                {searchTerm || statusFilter !== "all" || typeFilter !== "all" || clientFilter !== "all"
                                    ? "Try adjusting your search or filter criteria"
                                    : "Documents from your assigned clients will appear here"
                                }
                            </p>
                            {(searchTerm || statusFilter !== "all" || typeFilter !== "all" || clientFilter !== "all") && (
                                <Button variant="outline" onClick={() => {
                                    setSearchTerm("");
                                    setStatusFilter("all");
                                    setTypeFilter("all");
                                    setClientFilter("all");
                                }}>
                                    Clear Filters
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Summary Stats */}
                {filteredDocuments.length > 0 && (
                    <Card className="mt-6">
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-blue-600">
                                        {filteredDocuments.length}
                                    </div>
                                    <div className="text-sm text-gray-600">Total Documents</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-orange-600">
                                        {filteredDocuments.filter(d => d.status === 'PENDING_REVIEW').length}
                                    </div>
                                    <div className="text-sm text-gray-600">Pending Review</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-purple-600">
                                        {filteredDocuments.filter(d => d.status === 'IN_PROGRESS').length}
                                    </div>
                                    <div className="text-sm text-gray-600">In Progress</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-green-600">
                                        {filteredDocuments.filter(d => d.status === 'COMPLETED').length}
                                    </div>
                                    <div className="text-sm text-gray-600">Completed</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default AccountantDocuments; 