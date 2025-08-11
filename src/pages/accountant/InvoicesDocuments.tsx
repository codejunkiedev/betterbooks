import { useState, useEffect, useCallback } from "react";
import { Button } from "@/shared/components/Button";
import { useToast } from "@/shared/hooks/useToast";
import { Card } from "@/shared/components/Card";
import { Badge } from "@/shared/components";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/Select";
import { Input } from "@/shared/components/Input";
import { Label } from "@/shared/components/Label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/Dialog";
import { getDocumentsByCompanyId } from "@/shared/services/supabase/document";
import { getPaginatedAccountantClients } from "@/shared/services/supabase/company";
import { DocumentType, DocumentStatus } from "@/shared/constants/documents";
import { FileText, Receipt, CreditCard, Building2, Filter, ChevronLeft, ChevronRight, Calculator, Eye } from "lucide-react";
import { format } from "date-fns";
import { Document, DocumentFilters } from "@/shared/types/document";
import { DocumentPreview } from "@/shared/components/DocumentPreview";
import { DocumentActionButtons } from "@/shared/components/DocumentActionButtons";

const ITEMS_PER_PAGE = 10;

// Create a more flexible filter type that allows undefined values
type FilterState = {
    type?: DocumentType | undefined;
    status?: DocumentStatus | undefined;
    date_from?: string | undefined;
    date_to?: string | undefined;
};

const InvoicesDocuments = () => {
    const { toast } = useToast();

    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
    const [selectedClient, setSelectedClient] = useState<string>('');
    const [clients, setClients] = useState<Array<{ id: string; name: string }>>([]);
    const [filters, setFilters] = useState<FilterState>({});
    const [tempFilters, setTempFilters] = useState<FilterState>({});

    // Load clients for the accountant
    useEffect(() => {
        const loadClients = async () => {
            try {
                const { data, error } = await getPaginatedAccountantClients(1, 100, {});
                if (error) throw error;
                
                if (data) {
                    setClients(data.items.map(client => ({
                        id: client.id,
                        name: client.name
                    })));
                }
            } catch (error) {
                console.error('Error loading clients:', error);
                toast({
                    title: "Error",
                    description: "Failed to load clients",
                    variant: "destructive",
                });
            }
        };
        loadClients();
    }, [toast]);

    const loadDocuments = useCallback(async () => {
        if (!selectedClient) return;
        
        try {
            setIsLoading(true);
            // Convert FilterState to DocumentFilters by filtering out undefined values
            const documentFilters: DocumentFilters = {};
            if (filters.type !== undefined) documentFilters.type = filters.type;
            if (filters.status !== undefined) documentFilters.status = filters.status;
            if (filters.date_from !== undefined) documentFilters.date_from = filters.date_from;
            if (filters.date_to !== undefined) documentFilters.date_to = filters.date_to;

            const { data, error } = await getDocumentsByCompanyId(selectedClient, documentFilters);
            if (error) {
                throw error;
            }
            setDocuments(data || []);
            setTotalItems(data?.length || 0);
        } catch (error) {
            console.error('Error loading documents:', error);
            toast({
                title: "Error",
                description: "Failed to load documents. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [selectedClient, filters, toast]);

    useEffect(() => {
        if (selectedClient) {
            loadDocuments();
        }
    }, [loadDocuments]);

    // Initialize temp filters when modal opens
    useEffect(() => {
        if (isFilterModalOpen) {
            setTempFilters(filters);
        }
    }, [isFilterModalOpen, filters]);

    const handlePreview = async (doc: Document) => {
        setPreviewDocument(doc);
        setIsPreviewOpen(true);
    };



    const handleFilterApply = () => {
        setFilters(tempFilters);
        setCurrentPage(1);
        setIsFilterModalOpen(false);
    };

    const handleFilterReset = () => {
        setTempFilters({});
        setFilters({});
        setCurrentPage(1);
        setIsFilterModalOpen(false);
    };

    const getDocumentTypeIcon = (type: DocumentType) => {
        switch (type) {
            case 'INVOICE':
                return <Receipt className="h-4 w-4" />;
            case 'RECEIPT':
                return <CreditCard className="h-4 w-4" />;
            case 'BANK_STATEMENT':
                return <Building2 className="h-4 w-4" />;
            case 'TAX_RETURN':
            case 'TAX_VOUCHER':
            case 'TAX_SUMMARY':
                return <Calculator className="h-4 w-4" />;
            default:
                return <FileText className="h-4 w-4" />;
        }
    };

    const getStatusBadgeVariant = (status: DocumentStatus) => {
        switch (status) {
            case 'PENDING_REVIEW':
                return 'secondary';
            case 'IN_PROGRESS':
                return 'default';
            case 'COMPLETED':
                return 'outline';
            case 'USER_INPUT_NEEDED':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    if (!selectedClient) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="text-center space-y-3">
                        <h1 className="text-3xl font-bold tracking-tight">Invoices & Documents</h1>
                        <p className="text-gray-500 text-lg">View and manage client documents</p>
                    </div>
                    
                    <Card className="p-6">
                        <div className="text-center space-y-4">
                            <FileText className="h-16 w-16 text-gray-400 mx-auto" />
                            <h3 className="text-lg font-medium text-gray-900">Select a Client</h3>
                            <p className="text-gray-500">Choose a client to view their invoices and documents</p>
                            
                            <Select value={selectedClient} onValueChange={setSelectedClient}>
                                <SelectTrigger className="w-64 mx-auto">
                                    <SelectValue placeholder="Select a client" />
                                </SelectTrigger>
                                <SelectContent>
                                    {clients.map((client) => (
                                        <SelectItem key={client.id} value={client.id}>
                                            {client.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div className="space-y-3">
                        <h1 className="text-3xl font-bold tracking-tight">Invoices & Documents</h1>
                        <p className="text-gray-500 text-lg">
                            Viewing documents for {clients.find(c => c.id === selectedClient)?.name}
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setIsFilterModalOpen(true)}
                            className="flex items-center gap-2"
                        >
                            <Filter className="h-4 w-4" />
                            Filters
                        </Button>
                        
                        <Select value={selectedClient} onValueChange={setSelectedClient}>
                            <SelectTrigger className="w-48">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {clients.map((client) => (
                                    <SelectItem key={client.id} value={client.id}>
                                        {client.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Receipt className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {documents.filter(d => d.type === 'INVOICE').length}
                                </p>
                            </div>
                        </div>
                    </Card>
                    
                    <Card className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CreditCard className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Receipts</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {documents.filter(d => d.type === 'RECEIPT').length}
                                </p>
                            </div>
                        </div>
                    </Card>
                    
                    <Card className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <FileText className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {documents.filter(d => d.status === 'PENDING_REVIEW').length}
                                </p>
                            </div>
                        </div>
                    </Card>
                    
                    <Card className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Calculator className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Other Documents</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {documents.filter(d => !['INVOICE', 'RECEIPT', 'BANK_STATEMENT'].includes(d.type)).length}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Documents Table */}
                <Card className="p-6">
                    <div className="space-y-6">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                            </div>
                        ) : documents.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
                                <p className="text-gray-500">No documents match your current filters.</p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-3 px-4 font-medium text-gray-900">Document</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-900">Uploaded</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {documents.map((doc) => (
                                                <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center gap-3">
                                                            {getDocumentTypeIcon(doc.type)}
                                                            <span className="font-medium text-gray-900">
                                                                {doc.original_filename}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <Badge variant="outline">
                                                            {doc.type.replace('_', ' ')}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <Badge variant={getStatusBadgeVariant(doc.status)}>
                                                            {doc.status.replace('_', ' ')}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-3 px-4 text-gray-600">
                                                        {format(new Date(doc.uploaded_at), 'MMM dd, yyyy')}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handlePreview(doc)}
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <DocumentActionButtons document={doc} />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-gray-700">
                                            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to{' '}
                                            {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems} results
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(currentPage - 1)}
                                                disabled={currentPage === 1}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                                Previous
                                            </Button>
                                            <span className="text-sm text-gray-700">
                                                Page {currentPage} of {totalPages}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                            >
                                                Next
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </Card>
            </div>

            {/* Filter Modal */}
            <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Filter Documents</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="type">Document Type</Label>
                            <Select value={tempFilters.type || ''} onValueChange={(value) => setTempFilters(prev => ({ ...prev, type: value as DocumentType }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All types</SelectItem>
                                    <SelectItem value="INVOICE">Invoice</SelectItem>
                                    <SelectItem value="RECEIPT">Receipt</SelectItem>
                                    <SelectItem value="BANK_STATEMENT">Bank Statement</SelectItem>
                                    <SelectItem value="TAX_RETURN">Tax Return</SelectItem>
                                    <SelectItem value="TAX_VOUCHER">Tax Voucher</SelectItem>
                                    <SelectItem value="TAX_SUMMARY">Tax Summary</SelectItem>
                                    <SelectItem value="OTHER">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div>
                            <Label htmlFor="status">Status</Label>
                            <Select value={tempFilters.status || ''} onValueChange={(value) => setTempFilters(prev => ({ ...prev, status: value as DocumentStatus }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All statuses</SelectItem>
                                    <SelectItem value="PENDING_REVIEW">Pending Review</SelectItem>
                                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                    <SelectItem value="USER_INPUT_NEEDED">User Input Needed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="date_from">From Date</Label>
                                <Input
                                    type="date"
                                    id="date_from"
                                    value={tempFilters.date_from || ''}
                                    onChange={(e) => setTempFilters(prev => ({ ...prev, date_from: e.target.value }))}
                                />
                            </div>
                            <div>
                                <Label htmlFor="date_to">To Date</Label>
                                <Input
                                    type="date"
                                    id="date_to"
                                    value={tempFilters.date_to || ''}
                                    onChange={(e) => setTempFilters(prev => ({ ...prev, date_to: e.target.value }))}
                                />
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3 pt-4">
                            <Button onClick={handleFilterApply} className="flex-1">
                                Apply Filters
                            </Button>
                            <Button variant="outline" onClick={handleFilterReset} className="flex-1">
                                Reset
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Document Preview Modal */}
            {previewDocument && (
                <DocumentPreview
                    document={previewDocument}
                    isOpen={isPreviewOpen}
                    onClose={() => setIsPreviewOpen(false)}
                />
            )}

            {/* Comment functionality can be added here if needed */}
        </div>
    );
};

export default InvoicesDocuments; 