import { Button } from "@/shared/components/Button";
import { Download, Eye, MessageSquare, BookOpen } from "lucide-react";
import { Document } from "@/shared/types/document";
import { useDocumentActions } from "./documentUtils";

interface DocumentActionButtonsProps {
    document: Document;
    // onDelete?: (documentId: string) => void;
    onPreview?: (document: Document) => void;
    onComments?: (document: Document) => void;
    onCreateJournalEntry?: (document: Document) => void;
    showPreview?: boolean;
    showDownload?: boolean;
    showComments?: boolean;
    showCreateJournalEntry?: boolean;
    // showDelete?: boolean;
    size?: "sm" | "default" | "lg";
    variant?: "ghost" | "outline" | "default";
}

export const DocumentActionButtons = ({
    document,
    // onDelete,
    onPreview,
    onComments,
    onCreateJournalEntry,
    showPreview = true,
    showDownload = true,
    showComments = true,
    showCreateJournalEntry = false,
    // showDelete = true,
    size = "sm",
    variant = "ghost"
}: DocumentActionButtonsProps) => {
    const { handleDownload } = useDocumentActions();

    const handlePreviewClick = () => {
        if (onPreview) {
            onPreview(document);
        }
    };

    const handleCommentsClick = () => {
        if (onComments) {
            onComments(document);
        }
    };

    const handleCreateJournalEntryClick = () => {
        if (onCreateJournalEntry) {
            onCreateJournalEntry(document);
        }
    };

    // const handleDeleteClick = () => {
    //     if (onDelete) {
    //         onDelete(document.id);
    //     }
    // };

    return (
        <div className="flex items-center gap-2">
            {showPreview && (
                <Button
                    variant={variant}
                    size={size}
                    onClick={handlePreviewClick}
                    className="h-8 w-8 p-0"
                    title="Preview document"
                >
                    <Eye className="h-4 w-4" />
                </Button>
            )}

            {showDownload && (
                <Button
                    variant={variant}
                    size={size}
                    onClick={() => handleDownload(document)}
                    className="h-8 w-8 p-0"
                    title="Download document"
                >
                    <Download className="h-4 w-4" />
                </Button>
            )}

            {showComments && (
                <Button
                    variant={variant}
                    size={size}
                    onClick={handleCommentsClick}
                    className="h-8 w-8 p-0"
                    title="View comments"
                >
                    <MessageSquare className="h-4 w-4" />
                </Button>
            )}

            {showCreateJournalEntry && document.status === 'PENDING_REVIEW' && (
                <Button
                    variant={variant}
                    size={size}
                    onClick={handleCreateJournalEntryClick}
                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                    title="Create journal entry"
                >
                    <BookOpen className="h-4 w-4" />
                </Button>
            )}

            {/* {showDelete && onDelete && (
                <Button
                    variant={variant}
                    size={size}
                    onClick={handleDeleteClick}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    title="Delete document"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            )} */}
        </div>
    );
}; 