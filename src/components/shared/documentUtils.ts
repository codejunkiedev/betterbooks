import { getDocumentDownloadUrl } from "@/lib/supabase/document";
import { Document } from "@/interfaces/document";
import { useToast } from "@/hooks/use-toast";

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

            toast({
                title: "Download started",
                description: "Your document is being downloaded. Please wait...",
            });

            const downloadUrl = await getDocumentDownloadUrl(doc.file_path);
            if (downloadUrl) {
                // Fetch the file as blob to force download
                const response = await fetch(downloadUrl);
                const blob = await response.blob();

                // Create blob URL
                const blobUrl = window.URL.createObjectURL(blob);

                // Create a temporary anchor element
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = doc.original_filename;
                link.style.display = 'none';

                // Append to body, click, and remove
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // Clean up blob URL
                window.URL.revokeObjectURL(blobUrl);

            } else {
                throw new Error('Failed to get download URL');
            }
        } catch (error) {
            console.error('Error downloading document:', error);
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
            console.error('Error previewing document:', error);
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
                // Fetch the file as blob to force download
                const response = await fetch(downloadUrl);
                const blob = await response.blob();

                // Create blob URL
                const blobUrl = window.URL.createObjectURL(blob);

                // Create a temporary anchor element
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = doc.original_filename;
                link.style.display = 'none';

                // Append to body, click, and remove
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // Clean up blob URL
                window.URL.revokeObjectURL(blobUrl);

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
            console.error('Error downloading document:', error);
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
            console.error('Error previewing document:', error);
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