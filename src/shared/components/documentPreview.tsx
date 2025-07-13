import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/dialog";
import { LoadingSpinner } from "@/shared/components/loading";
import { useState, useEffect } from "react";

interface DocumentPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  previewUrl: string | null;
  documentName?: string;
}

export const DocumentPreview = ({ isOpen, onClose, previewUrl, documentName }: DocumentPreviewProps) => {
  const [isImageLoading, setIsImageLoading] = useState(true);

  // Reset loading state when modal opens or URL changes
  useEffect(() => {
    if (isOpen && previewUrl) {
      setIsImageLoading(true);
    }
  }, [isOpen, previewUrl]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{documentName ? `Preview: ${documentName}` : 'Document Preview'}</DialogTitle>
        </DialogHeader>
        <div className="relative w-full h-[80vh] flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
          {previewUrl ? (
            <>
              {isImageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <LoadingSpinner text="Loading preview..." />
                </div>
              )}
              <img
                src={previewUrl}
                alt="Document preview"
                className="max-w-full max-h-full object-contain"
                onLoad={() => setIsImageLoading(false)}
                onError={() => {
                  setIsImageLoading(false);
                  console.error('Error loading image:', previewUrl);
                }}
              />
            </>
          ) : (
            <LoadingSpinner text="Loading preview..." />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Keep the old name for backward compatibility
export const InvoicePreview = DocumentPreview; 