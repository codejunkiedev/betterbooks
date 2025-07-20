import { Card, CardContent } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';
import { FileText, ArrowLeft, Download } from 'lucide-react';
import { DocumentActionButtons } from '@/shared/components/DocumentActionButtons';
import { DocumentPreview } from '@/shared/components/DocumentPreview';
import { CommentPanel } from '@/shared/components/CommentPanel';
import React from 'react';
import { Document } from '@/shared/types/document';

interface Company {
    id: string;
    name: string;
    type: string;
    is_active: boolean;
    created_at: string;
    user_id: string;
}

interface SelectedClientProps {
    selectedClient: Company;
    bankStatements: Document[];
    isBankStatementsLoading: boolean;
    handleBackToClients: () => void;
    handleDownloadAll: () => void;
    handlePreviewDocument: (document: Document) => void;
    handleCommentsDocument: (document: Document) => void;
    previewDocument: Document | null;
    setPreviewDocument: (doc: Document | null) => void;
    commentDocument: Document | null;
    setCommentDocument: (doc: Document | null) => void;
}

const SelectedClient: React.FC<SelectedClientProps> = ({
    selectedClient,
    bankStatements,
    isBankStatementsLoading,
    handleBackToClients,
    handleDownloadAll,
    handlePreviewDocument,
    handleCommentsDocument,
    previewDocument,
    setPreviewDocument,
    commentDocument,
    setCommentDocument
}) => {
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
};

export default SelectedClient; 