import { getDocumentDownloadUrl } from "@/shared/services/supabase/document";
import { Document } from "@/shared/types";
import { useToast } from "@/shared/hooks";


import { logger } from '@/shared/utils/logger';
interface ToastOptions {
    title: string;
    description: string;
    variant?: "default" | "destructive";
}

export interface DocumentActions {
    handlePreview: (doc: Document) => Promise<string | null>;
    handleDownload: (doc: Document) => Promise<void>;
}

export const useDocumentActions = (): DocumentActions => {
    const { toast } = useToast();

    const handleDownload = async (doc: Document) => {
        try {
            const downloadUrl = await getDocumentDownloadUrl(doc.file_path);
            if (downloadUrl) {
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = doc.original_filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                toast({
                    title: "Download started",
                    description: "Your document is being downloaded.",
                });
            } else {
                throw new Error('Failed to get download URL');
            }
        } catch (error) {
            logger.error('Error downloading document:', error instanceof Error ? error : new Error(String(error)));
            toast({
                title: "Download failed",
                description: "Failed to download the document. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handlePreview = async (doc: Document): Promise<string | null> => {
        try {
            const downloadUrl = await getDocumentDownloadUrl(doc.file_path);
            if (downloadUrl) {
                return downloadUrl;
            } else {
                throw new Error('Failed to get preview URL');
            }
        } catch (error) {
            logger.error('Error previewing document:', error instanceof Error ? error : new Error(String(error)));
            toast({
                title: "Preview failed",
                description: "Failed to open the document preview. Please try again.",
                variant: "destructive",
            });
            return null;
        }
    };

    return {
        handlePreview,
        handleDownload,
    };
};

// Non-hook version for components that don't use hooks
export const documentActions = {
    download: async (doc: Document, showToast?: (toast: ToastOptions) => void) => {
        try {
            const downloadUrl = await getDocumentDownloadUrl(doc.file_path);
            if (downloadUrl) {
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = doc.original_filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                if (showToast) {
                    showToast({
                        title: "Download started",
                        description: "Your document is being downloaded.",
                    });
                }
            } else {
                throw new Error('Failed to get download URL');
            }
        } catch (error) {
            logger.error('Error downloading document:', error instanceof Error ? error : new Error(String(error)));
            if (showToast) {
                showToast({
                    title: "Download failed",
                    description: "Failed to download the document. Please try again.",
                    variant: "destructive",
                });
            }
        }
    },

    preview: async (doc: Document, showToast?: (toast: ToastOptions) => void): Promise<string | null> => {
        try {
            const downloadUrl = await getDocumentDownloadUrl(doc.file_path);
            if (downloadUrl) {
                return downloadUrl;
            } else {
                throw new Error('Failed to get preview URL');
            }
        } catch (error) {
            logger.error('Error previewing document:', error instanceof Error ? error : new Error(String(error)));
            if (showToast) {
                showToast({
                    title: "Preview failed",
                    description: "Failed to open the document preview. Please try again.",
                    variant: "destructive",
                });
            }
            return null;
        }
    },
}; 