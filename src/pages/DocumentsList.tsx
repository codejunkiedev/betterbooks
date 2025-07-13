import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getPaginatedDocuments, deleteDocument } from "@/lib/supabase/document";
import { DocumentType, DocumentStatus } from "@/constants/documents";
import { FileText, Receipt, CreditCard, Building2, Calendar, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { Document, DocumentFilters } from "@/interfaces/document";
import { DocumentPreview } from "@/components/shared/documentPreview";
import { useDocumentActions } from "@/components/shared/documentUtils";
import { DocumentActionButtons } from "@/components/shared/DocumentActionButtons";

const ITEMS_PER_PAGE = 5;

const DocumentsList = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState<DocumentFilters>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [tempFilters, setTempFilters] = useState<DocumentFilters>({});
    const { toast } = useToast();
    const { handlePreview: getPreviewUrl } = useDocumentActions();

    useEffect(() => {
        loadDocuments();
    }, [filters, currentPage]);

    // Initialize temp filters when modal opens
    useEffect(() => {
        if (isFilterModalOpen) {
            setTempFilters(filters);
        }
    }, [isFilterModalOpen, filters]);

    const loadDocuments = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await getPaginatedDocuments(currentPage, ITEMS_PER_PAGE, filters);
            if (error) {
                throw error;
            }
            setDocuments(data?.items || []);
            setTotalItems(data?.total || 0);
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
    };

    const handlePreview = async (doc: Document) => {
        const previewUrl = await getPreviewUrl(doc);
        if (previewUrl) {
            setPreviewUrl(previewUrl);
            setPreviewDocument(doc);
            setIsPreviewOpen(true);
        }
    };

    const handleDelete = async (documentId: string) => {
        if (!confirm('Are you sure you want to delete this document?')) {
            return;
        }

        try {
            const { error } = await deleteDocument(documentId);
            if (error) {
                throw error;
            }

            toast({
                title: "Document deleted",
                description: "The document has been deleted successfully.",
            });

            // If we're on the last page and it becomes empty, go to previous page
            if (documents.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            } else {
                loadDocuments();
            }
        } catch (error) {
            console.error('Error deleting document:', error);
            toast({
                title: "Delete failed",
                description: "Failed to delete the document. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handlePageChange = (newPage: number) => {
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleApplyFilters = () => {
        setFilters(tempFilters);
        setCurrentPage(1); // Reset to first page when filters are applied
        setIsFilterModalOpen(false);
    };

    const handleClearFilters = () => {
        setTempFilters({});
        setFilters({});
        setCurrentPage(1);
        setIsFilterModalOpen(false);
    };

    const getActiveFiltersCount = () => {
        return Object.values(filters).filter(value => value !== undefined && value !== '').length;
    };

    const getStatusBadge = (status: DocumentStatus) => {
        const statusConfig = {
            PENDING_REVIEW: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending Review' },
            IN_PROGRESS: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'In Progress' },
            COMPLETED: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Completed' },
        };

        const config = statusConfig[status];
        return (
            <Badge
                className={`${config.color} border hover:bg-opacity-100 hover:no-underline`}
                style={{
                    backgroundColor: status === 'PENDING_REVIEW' ? '#fef3c7' :
                        status === 'IN_PROGRESS' ? '#dbeafe' :
                            status === 'COMPLETED' ? '#dcfce7' : '#f3f4f6',
                    color: status === 'PENDING_REVIEW' ? '#92400e' :
                        status === 'IN_PROGRESS' ? '#1e40af' :
                            status === 'COMPLETED' ? '#166534' : '#374151',
                    borderColor: status === 'PENDING_REVIEW' ? '#fde68a' :
                        status === 'IN_PROGRESS' ? '#bfdbfe' :
                            status === 'COMPLETED' ? '#bbf7d0' : '#d1d5db'
                }}
            >
                {config.label}
            </Badge>
        );
    };

    const getDocumentIcon = (type: DocumentType) => {
        const iconConfig = {
            INVOICE: Receipt,
            RECEIPT: CreditCard,
            BANK_STATEMENT: Building2,
            OTHER: FileText,
        };

        const Icon = iconConfig[type] || FileText;
        return <Icon className="h-5 w-5" />;
    };

    const getDocumentTypeLabel = (type: DocumentType) => {
        const labelConfig = {
            INVOICE: 'Invoice',
            RECEIPT: 'Receipt',
            BANK_STATEMENT: 'Bank Statement',
            OTHER: 'Other',
        };

        return labelConfig[type];
    };

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
                        <p className="text-gray-500 text-lg">View and manage your uploaded documents</p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => setIsFilterModalOpen(true)}
                        className="flex items-center gap-2"
                    >
                        <Filter className="h-4 w-4" />
                        Filters
                        {getActiveFiltersCount() > 0 && (
                            <Badge variant="secondary" className="ml-1">
                                {getActiveFiltersCount()}
                            </Badge>
                        )}
                    </Button>
                </div>

                {/* Documents List */}
                <Card className="p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
                            <p className="text-gray-500">Upload some documents to get started.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {documents.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="p-2 rounded-lg bg-gray-100">
                                                {getDocumentIcon(doc.type)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-medium text-gray-900">{doc.original_filename}</h4>
                                                    {getStatusBadge(doc.status)}
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <FileText className="h-4 w-4" />
                                                        {getDocumentTypeLabel(doc.type)}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        {format(new Date(doc.uploaded_at), 'MMM dd, yyyy')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <DocumentActionButtons
                                            document={doc}
                                            onPreview={handlePreview}
                                            onDelete={handleDelete}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {documents.length > 0 && totalItems > 0 && (
                        <div className="mt-6 flex items-center justify-between px-2">
                            <div className="text-sm text-gray-500">
                                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems} documents
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <div className="text-sm text-gray-500">
                                    Page {currentPage} of {totalPages}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            {/* Filter Modal */}
            <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filter Documents
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="type-filter">Document Type</Label>
                            <Select
                                value={tempFilters.type || 'all'}
                                onValueChange={(value) => setTempFilters(prev => ({
                                    ...prev,
                                    type: value === 'all' ? undefined : value as DocumentType
                                }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All types</SelectItem>
                                    <SelectItem value="INVOICE">Invoice</SelectItem>
                                    <SelectItem value="RECEIPT">Receipt</SelectItem>
                                    <SelectItem value="BANK_STATEMENT">Bank Statement</SelectItem>
                                    <SelectItem value="OTHER">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="status-filter">Status</Label>
                            <Select
                                value={tempFilters.status || 'all'}
                                onValueChange={(value) => setTempFilters(prev => ({
                                    ...prev,
                                    status: value === 'all' ? undefined : value as DocumentStatus
                                }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All statuses</SelectItem>
                                    <SelectItem value="PENDING_REVIEW">Pending Review</SelectItem>
                                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="date-from">Date From</Label>
                            <div className="relative">
                                <Input
                                    id="date-from"
                                    type="date"
                                    value={tempFilters.date_from || ''}
                                    onChange={(e) => setTempFilters(prev => ({
                                        ...prev,
                                        date_from: e.target.value || undefined
                                    }))}
                                    className="pr-10"
                                />
                                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="date-to">Date To</Label>
                            <div className="relative">
                                <Input
                                    id="date-to"
                                    type="date"
                                    value={tempFilters.date_to || ''}
                                    onChange={(e) => setTempFilters(prev => ({
                                        ...prev,
                                        date_to: e.target.value || undefined
                                    }))}
                                    className="pr-10"
                                />
                                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                        <div className="flex gap-2 pt-4">
                            <Button onClick={handleApplyFilters} className="flex-1">
                                Apply Filters
                            </Button>
                            <Button variant="outline" onClick={handleClearFilters} className="flex-1">
                                Clear All
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Document Preview Modal */}
            <DocumentPreview
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                previewUrl={previewUrl}
                documentName={previewDocument?.original_filename}
            />
        </div>
    );
};

export default DocumentsList; 