import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/Dialog";
import { LoadingSpinner } from "@/shared/components/Loading";
import { useState, useEffect, useCallback } from "react";
import { Document } from "@/shared/types/document";
import { getDocumentDownloadUrl } from "@/shared/services/supabase/document";

interface DocumentPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document;
}

// Legacy interface for backward compatibility
interface LegacyDocumentPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  previewUrl: string | null;
  documentName?: string;
}

export const DocumentPreview = ({ isOpen, onClose, document }: DocumentPreviewProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPreviewUrl = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const url = await getDocumentDownloadUrl(document.file_path);
      setPreviewUrl(url);
    } catch (err) {
      console.error('Error loading preview URL:', err);
      setError('Failed to load document preview');
    } finally {
      setIsLoading(false);
    }
  }, [document.file_path]);

  useEffect(() => {
    if (isOpen && document) {
      loadPreviewUrl();
    }
  }, [isOpen, document, loadPreviewUrl]);

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const isPDF = (filename: string) => {
    return getFileExtension(filename) === 'pdf';
  };

  const isImage = (filename: string) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    return imageExtensions.includes(getFileExtension(filename));
  };

  const renderPreview = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <LoadingSpinner text="Loading preview..." />
        </div>
      );
    }

    if (error || !previewUrl) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <div className="text-lg mb-2">Preview not available</div>
          <div className="text-sm">{error || 'Unable to load document preview'}</div>
        </div>
      );
    }

    if (isPDF(document.original_filename)) {
      return (
        <iframe
          src={previewUrl}
          className="w-full h-full border-0"
          title={`Preview: ${document.original_filename}`}
        />
      );
    }

    if (isImage(document.original_filename)) {
      return (
        <img
          src={previewUrl}
          alt={`Preview: ${document.original_filename}`}
          className="max-w-full max-h-full object-contain"
          onError={() => {
            console.error('Error loading image:', previewUrl);
            setError('Failed to load image preview');
          }}
        />
      );
    }

    // For other file types, show download option
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <div className="text-lg mb-2">Preview not available</div>
        <div className="text-sm mb-4">This file type cannot be previewed in the browser</div>
        <a
          href={previewUrl}
          download={document.original_filename}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Download File
        </a>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Preview: {document.original_filename}</DialogTitle>
        </DialogHeader>
        <div className="relative w-full h-[80vh] flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
          {renderPreview()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Legacy component for backward compatibility with old interface
const LegacyDocumentPreview = ({ isOpen, onClose, previewUrl, documentName }: LegacyDocumentPreviewProps) => {
  const [isImageLoading, setIsImageLoading] = useState(true);

  // Reset loading state when modal opens or URL changes
  useEffect(() => {
    if (isOpen && previewUrl) {
      setIsImageLoading(true);
    }
  }, [isOpen, previewUrl]);

  const getFileExtension = (filename: string) => {
    return filename?.split('.').pop()?.toLowerCase() || '';
  };

  const isPDF = (filename: string) => {
    return getFileExtension(filename) === 'pdf';
  };

  const isImage = (filename: string) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    return imageExtensions.includes(getFileExtension(filename));
  };

  const renderLegacyPreview = () => {
    if (!previewUrl) {
      return <LoadingSpinner text="Loading preview..." />;
    }

    const filename = documentName || '';

    if (isPDF(filename)) {
      return (
        <iframe
          src={previewUrl}
          className="w-full h-full border-0"
          title={`Preview: ${filename}`}
        />
      );
    }

    if (isImage(filename) || !filename) {
      return (
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
      );
    }

    // For other file types
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <div className="text-lg mb-2">Preview not available</div>
        <div className="text-sm mb-4">This file type cannot be previewed in the browser</div>
        <a
          href={previewUrl}
          download={filename}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Download File
        </a>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{documentName ? `Preview: ${documentName}` : 'Document Preview'}</DialogTitle>
        </DialogHeader>
        <div className="relative w-full h-[80vh] flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
          {renderLegacyPreview()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Keep the old name for backward compatibility with legacy interface
export const InvoicePreview = LegacyDocumentPreview; 