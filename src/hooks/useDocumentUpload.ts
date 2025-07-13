import { useState } from 'react';
import { DocumentType } from '../core/domain/entities/Document';
import { UploadDocumentUseCase } from '../core/application/use-cases/documents/UploadDocumentUseCase';
import { Container } from '../infrastructure/di/Container';
import { useToast } from './use-toast';

export interface UploadProgress {
    fileName: string;
    progress: number;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    error?: string;
}

export const useDocumentUpload = (companyId: string, userId: string) => {
    const [uploads, setUploads] = useState<UploadProgress[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();

    // Get dependencies from container
    const container = Container.getInstance();
    const uploadDocumentUseCase = new UploadDocumentUseCase(
        container.getDocumentRepository(),
        container.getFileStorageService()
    );

    const validateFile = (file: File): string | null => {
        // Check file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            return 'Invalid file type. Only PDF, JPEG, and PNG files are allowed.';
        }

        // Check file size (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return 'File size too large. Maximum size is 10MB.';
        }

        return null;
    };

    const uploadFile = async (file: File, type: DocumentType): Promise<boolean> => {
        // Validate file
        const validationError = validateFile(file);
        if (validationError) {
            toast({
                title: "Validation Error",
                description: validationError,
                variant: "destructive"
            });
            return false;
        }

        // Add to uploads list
        setUploads(prev => [...prev, {
            fileName: file.name,
            progress: 0,
            status: 'pending'
        }]);

        setIsUploading(true);

        try {
            // Update status to uploading
            setUploads(prev => prev.map(upload =>
                upload.fileName === file.name
                    ? { ...upload, status: 'uploading', progress: 10 }
                    : upload
            ));

            const result = await uploadDocumentUseCase.execute({
                companyId,
                uploadedByUserId: userId,
                file,
                type
            });

            if (result.isSuccess) {
                // Update status to completed
                setUploads(prev => prev.map(upload =>
                    upload.fileName === file.name
                        ? { ...upload, status: 'completed', progress: 100 }
                        : upload
                ));

                toast({
                    title: "Success",
                    description: `${file.name} uploaded successfully!`,
                });

                return true;
            } else {
                // Update status to error
                setUploads(prev => prev.map(upload =>
                    upload.fileName === file.name
                        ? { ...upload, status: 'error', error: result.error }
                        : upload
                ));

                toast({
                    title: "Upload Failed",
                    description: result.error,
                    variant: "destructive"
                });

                return false;
            }
        } catch {
            // Update status to error
            setUploads(prev => prev.map(upload =>
                upload.fileName === file.name
                    ? { ...upload, status: 'error', error: 'Upload failed' }
                    : upload
            ));

            toast({
                title: "Upload Failed",
                description: "An unexpected error occurred during upload.",
                variant: "destructive"
            });

            return false;
        } finally {
            setIsUploading(false);
        }
    };

    const uploadMultipleFiles = async (files: File[], type: DocumentType): Promise<void> => {
        setIsUploading(true);

        const uploadPromises = files.map(file => uploadFile(file, type));
        const results = await Promise.allSettled(uploadPromises);

        const successCount = results.filter(result =>
            result.status === 'fulfilled' && result.value
        ).length;

        const failureCount = files.length - successCount;

        if (successCount > 0) {
            toast({
                title: "Upload Complete",
                description: `Successfully uploaded ${successCount} file(s)${failureCount > 0 ? `, ${failureCount} failed` : ''}`,
            });
        }

        setIsUploading(false);
    };

    const removeUpload = (fileName: string) => {
        setUploads(prev => prev.filter(upload => upload.fileName !== fileName));
    };

    const clearUploads = () => {
        setUploads([]);
    };

    const getUploadStats = () => {
        const total = uploads.length;
        const completed = uploads.filter(u => u.status === 'completed').length;
        const failed = uploads.filter(u => u.status === 'error').length;
        const pending = uploads.filter(u => u.status === 'pending').length;
        const uploading = uploads.filter(u => u.status === 'uploading').length;

        return { total, completed, failed, pending, uploading };
    };

    return {
        // State
        uploads,
        isUploading,

        // Actions
        uploadFile,
        uploadMultipleFiles,
        removeUpload,
        clearUploads,

        // Computed
        uploadStats: getUploadStats(),

        // Utilities
        validateFile
    };
}; 