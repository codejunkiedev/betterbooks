import { useState, useCallback, useEffect } from "react";
import { Button } from "@/shared/components/Button";
import { useToast } from "@/shared/hooks/useToast";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/Card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/Select";
import { X, Upload, FileText, Calculator, Receipt, Building, Users, Calendar, Folder } from "lucide-react";
import { uploadDocumentsForCompany } from "@/shared/services/supabase/document";
import { getMyClientCompanies } from "@/shared/services/supabase/company";
import { getDocumentsByCompanyId } from "@/shared/services/supabase/document";
import { RadioGroup, RadioGroupItem } from "@/shared/components/RadioGroup";
import { Label } from "@/shared/components/Label";
import { Progress } from "@/shared/components/Progress";
import { Badge } from "@/shared/components/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/Tabs";
import { DocumentType } from "@/shared/constants/documents";
import { Document } from "@/shared/types/document";
import { DocumentPreview } from "@/shared/components/DocumentPreview";
import { CommentPanel } from "@/shared/components/CommentPanel";
import { DocumentActionButtons } from "@/shared/components/DocumentActionButtons";
import { AskUserModal } from "@/shared/components/AskUserModal";
import { format } from "date-fns";

interface Company {
    id: string;
    name: string;
    user_id: string;
}

export default function TaxDocuments() {
    const [files, setFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [documentType, setDocumentType] = useState<DocumentType>('TAX_RETURN');
    const [selectedClient, setSelectedClient] = useState<string>('');
    const [clients, setClients] = useState<Company[]>([]);
    const [isLoadingClients, setIsLoadingClients] = useState(true);

    // New state for viewing documents
    const [taxDocuments, setTaxDocuments] = useState<Document[]>([]);
    const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
    const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
    const [commentDocument, setCommentDocument] = useState<Document | null>(null);
    const [askUserDocument, setAskUserDocument] = useState<Document | null>(null);
    const [activeTab, setActiveTab] = useState("upload");

    const { toast } = useToast();

    // Load clients on component mount
    useEffect(() => {
        const loadClients = async () => {
            try {
                setIsLoadingClients(true);
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
                setIsLoadingClients(false);
            }
        };

        loadClients();
    }, [toast]);

    const loadTaxDocuments = useCallback(async () => {
        if (!selectedClient) return;

        try {
            setIsLoadingDocuments(true);
            const { data, error } = await getDocumentsByCompanyId(selectedClient);

            if (error) {
                throw error;
            }

            // Filter for tax document types
            const taxDocs = (data || []).filter(doc =>
                doc.type === 'TAX_RETURN' || doc.type === 'TAX_VOUCHER' || doc.type === 'TAX_SUMMARY'
            );

            setTaxDocuments(taxDocs);
        } catch (error) {
            console.error('Error loading tax documents:', error);
            toast({
                title: 'Error',
                description: 'Failed to load tax documents',
                variant: 'destructive',
            });
        } finally {
            setIsLoadingDocuments(false);
        }
    }, [selectedClient, toast]);

    // Load tax documents when client is selected and on the view tab
    useEffect(() => {
        if (selectedClient && activeTab === "view") {
            loadTaxDocuments();
        }
    }, [selectedClient, activeTab, loadTaxDocuments]);

    const validateFiles = useCallback((fileList: FileList): File[] => {
        const validFiles: File[] = [];
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];

        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            if (file.size > maxSize) {
                toast({
                    title: "File too large",
                    description: `${file.name} is larger than 10MB. Please select a smaller file.`,
                    variant: "destructive",
                });
                continue;
            }

            if (!allowedTypes.includes(file.type)) {
                toast({
                    title: "Unsupported file type",
                    description: `${file.name} is not a supported file type. Please select PNG, JPEG, or PDF files.`,
                    variant: "destructive",
                });
                continue;
            }

            validFiles.push(file);
        }

        return validFiles;
    }, [toast]);

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles.length > 0) {
            const validFiles = validateFiles(droppedFiles);
            setFiles(prev => [...prev, ...validFiles]);
        }
    }, [validateFiles]);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const validFiles = validateFiles(e.target.files);
            setFiles(prev => [...prev, ...validFiles]);
        }
    }, [validateFiles]);

    const removeFile = useCallback((index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    }, []);

    const handleUpload = async () => {
        if (!selectedClient) {
            toast({
                title: "No client selected",
                description: "Please select a client before uploading documents.",
                variant: "destructive",
            });
            return;
        }

        if (!files.length) {
            toast({
                title: "No files selected",
                description: "Please select at least one file to upload.",
                variant: "destructive",
            });
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            setUploadProgress(25);

            const { error } = await uploadDocumentsForCompany({
                files,
                type: documentType,
                companyId: selectedClient,
            });

            if (error) {
                throw error;
            }

            setUploadProgress(100);

            toast({
                title: "Upload completed",
                description: `${files.length} tax ${files.length === 1 ? 'document' : 'documents'} uploaded successfully for ${clients.find(c => c.id === selectedClient)?.name}.`,
            });

            setFiles([]);

            // Refresh the documents list if we're on the view tab
            if (activeTab === "view") {
                loadTaxDocuments();
            }
        } catch (err) {
            console.error('Upload error:', err);
            toast({
                title: "Upload failed",
                description: "There was an error uploading your files. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const handlePreviewDocument = (document: Document) => {
        setPreviewDocument(document);
    };

    const handleCommentsDocument = (document: Document) => {
        setCommentDocument(document);
    };

    const handleAskUser = (document: Document) => {
        setAskUserDocument(document);
    };

    const getDocumentIcon = (type: DocumentType) => {
        const iconConfig = {
            TAX_RETURN: Calculator,
            TAX_VOUCHER: Receipt,
            TAX_SUMMARY: FileText,
        };

        const Icon = iconConfig[type as keyof typeof iconConfig] || FileText;
        return <Icon className="h-5 w-5" />;
    };

    const getDocumentTypeLabel = (type: DocumentType) => {
        const labelConfig = {
            TAX_RETURN: 'Tax Return',
            TAX_VOUCHER: 'Tax Voucher',
            TAX_SUMMARY: 'Tax Summary',
        };

        return labelConfig[type as keyof typeof labelConfig] || type;
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            PENDING_REVIEW: { variant: "secondary" as const, label: "Pending Review" },
            IN_PROGRESS: { variant: "default" as const, label: "In Progress" },
            COMPLETED: { variant: "default" as const, label: "Completed" },
            USER_INPUT_NEEDED: { variant: "destructive" as const, label: "User Input Needed" },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || { variant: "secondary" as const, label: status.replace('_', ' ').toLowerCase() };
        return (
            <Badge variant={config.variant} className="capitalize">
                {config.label}
            </Badge>
        );
    };

    const getSelectedClientName = () => {
        const client = clients.find(c => c.id === selectedClient);
        return client?.name || 'Select a client';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tax Documents</h1>
                    <p className="text-gray-600">Upload and manage tax-related documents for your clients</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Users className="w-4 h-4" />
                    <span>{clients.length} active clients</span>
                </div>
            </div>

            {/* Client Selection */}
            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-gray-900">Select Client</Label>
                        <Select value={selectedClient} onValueChange={setSelectedClient} disabled={isLoadingClients}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={isLoadingClients ? "Loading clients..." : "Choose a client"} />
                            </SelectTrigger>
                            <SelectContent>
                                {clients.map((client) => (
                                    <SelectItem key={client.id} value={client.id}>
                                        <div className="flex items-center gap-2">
                                            <Building className="w-4 h-4 text-gray-500" />
                                            {client.name}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {selectedClient && (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upload" className="flex items-center gap-2">
                            <Upload className="h-4 w-4" />
                            Upload Documents
                        </TabsTrigger>
                        <TabsTrigger value="view" className="flex items-center gap-2">
                            <Folder className="h-4 w-4" />
                            View Documents
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="upload" className="space-y-6">
                        {/* Upload Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building className="w-5 h-5 text-blue-600" />
                                    Upload Tax Documents for {getSelectedClientName()}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Document Type Selection */}
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                                    <Label className="text-sm font-bold mb-3 block text-gray-900">Tax Document Type</Label>
                                    <RadioGroup
                                        value={documentType}
                                        onValueChange={(value) => setDocumentType(value as DocumentType)}
                                        className="grid grid-cols-1 md:grid-cols-3 gap-3"
                                    >
                                        <div className="flex-1">
                                            <RadioGroupItem
                                                value="TAX_RETURN"
                                                id="tax_return"
                                                className="peer sr-only"
                                            />
                                            <Label
                                                htmlFor="tax_return"
                                                className="flex items-center justify-between rounded-md border-2 border-gray-200 bg-white px-3 py-3 hover:bg-gray-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5 cursor-pointer"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                                                        <Calculator className="h-2 w-2 text-white" />
                                                    </div>
                                                    <span className="font-bold text-gray-900 text-sm">Tax Returns</span>
                                                </div>
                                                <span className="text-xs font-medium text-gray-500">1040, 1120, etc.</span>
                                            </Label>
                                        </div>
                                        <div className="flex-1">
                                            <RadioGroupItem
                                                value="TAX_VOUCHER"
                                                id="tax_voucher"
                                                className="peer sr-only"
                                            />
                                            <Label
                                                htmlFor="tax_voucher"
                                                className="flex items-center justify-between rounded-md border-2 border-gray-200 bg-white px-3 py-3 hover:bg-gray-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5 cursor-pointer"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                                                        <Receipt className="h-2 w-2 text-white" />
                                                    </div>
                                                    <span className="font-bold text-gray-900 text-sm">Tax Vouchers</span>
                                                </div>
                                                <span className="text-xs font-medium text-gray-500">Estimated payments</span>
                                            </Label>
                                        </div>
                                        <div className="flex-1">
                                            <RadioGroupItem
                                                value="TAX_SUMMARY"
                                                id="tax_summary"
                                                className="peer sr-only"
                                            />
                                            <Label
                                                htmlFor="tax_summary"
                                                className="flex items-center justify-between rounded-md border-2 border-gray-200 bg-white px-3 py-3 hover:bg-gray-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5 cursor-pointer"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                                                        <FileText className="h-2 w-2 text-white" />
                                                    </div>
                                                    <span className="font-bold text-gray-900 text-sm">Summary Reports</span>
                                                </div>
                                                <span className="text-xs font-medium text-gray-500">Analysis & summaries</span>
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                {/* Drag and Drop Area */}
                                <div
                                    className={`p-10 border-2 border-dashed transition-all duration-200 bg-white rounded-xl ${isDragging
                                        ? 'border-primary bg-primary/5'
                                        : 'border-gray-300 group hover:border-gray-800 hover:bg-gray-50'
                                        }`}
                                    onDragEnter={handleDragEnter}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    <div className="text-center">
                                        <div className="flex flex-col items-center justify-center gap-6">
                                            <div className={`rounded-full p-5 transition-colors duration-200 ${isDragging ? 'bg-primary/10' : 'bg-gray-50'}`}>
                                                <Upload className={`h-10 w-10 transition-colors duration-200 ${isDragging ? 'text-primary' : 'text-gray-500'}`} />
                                            </div>
                                            <div className="space-y-3">
                                                <h3 className="text-xl font-medium text-gray-900">Drag and drop tax documents here</h3>
                                                <div className="space-y-2">
                                                    <p className="text-base text-gray-600">
                                                        or click to browse your files
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        Supported formats: PNG, JPEG, PDF (max 10MB per file)
                                                    </p>
                                                </div>
                                            </div>
                                            <input
                                                type="file"
                                                multiple
                                                accept=".png,.jpg,.jpeg,.pdf"
                                                onChange={handleFileSelect}
                                                className="hidden"
                                                id="file-upload"
                                            />
                                            <label
                                                htmlFor="file-upload"
                                                className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 h-12 px-8 shadow-sm hover:shadow-md"
                                            >
                                                <Upload className="h-4 w-4 mr-2 text-gray-600" />
                                                Browse Files
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Selected Files */}
                                {files.length > 0 && (
                                    <div className="space-y-3">
                                        <Label className="text-sm font-bold text-gray-900">Selected Files ({files.length})</Label>
                                        <div className="space-y-2">
                                            {files.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                                            <FileText className="h-4 w-4 text-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900 text-sm">{file.name}</p>
                                                            <p className="text-xs text-gray-500">
                                                                {(file.size / 1024 / 1024).toFixed(2)} MB • {getDocumentTypeLabel(documentType)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeFile(index)}
                                                        className="h-8 w-8 text-gray-500 hover:text-red-500"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Upload Progress */}
                                {isUploading && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm font-medium text-gray-900">Uploading...</Label>
                                            <span className="text-sm text-gray-500">{uploadProgress}%</span>
                                        </div>
                                        <Progress value={uploadProgress} className="w-full" />
                                    </div>
                                )}

                                {/* Upload Button */}
                                <Button
                                    onClick={handleUpload}
                                    disabled={isUploading || files.length === 0 || !selectedClient}
                                    className="w-full h-12"
                                >
                                    {isUploading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-4 w-4 mr-2" />
                                            Upload {files.length > 0 ? `${files.length} ` : ''}Tax Documents
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="view" className="space-y-6">
                        {/* View Documents Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calculator className="w-5 h-5 text-blue-600" />
                                    Tax Documents for {getSelectedClientName()}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isLoadingDocuments ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="text-gray-500">Loading tax documents...</div>
                                    </div>
                                ) : taxDocuments.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No tax documents found</h3>
                                        <p className="text-gray-500 mb-4">
                                            No tax documents have been uploaded for this client yet.
                                        </p>
                                        <Button
                                            onClick={() => setActiveTab("upload")}
                                            className="flex items-center gap-2"
                                        >
                                            <Upload className="h-4 w-4" />
                                            Upload Tax Documents
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {taxDocuments.map((doc) => (
                                            <div
                                                key={doc.id}
                                                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="p-2 rounded-lg bg-blue-100">
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
                                                        onPreview={handlePreviewDocument}
                                                        onComments={handleCommentsDocument}
                                                        onAskUser={handleAskUser}
                                                        showPreview={true}
                                                        showDownload={true}
                                                        showComments={true}
                                                        showAskUser={true}
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
                    </TabsContent>
                </Tabs>
            )}

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

            {/* Ask User Modal */}
            {askUserDocument && (
                <AskUserModal
                    isOpen={!!askUserDocument}
                    onClose={() => setAskUserDocument(null)}
                    document={askUserDocument}
                />
            )}
        </div>
    );
} 