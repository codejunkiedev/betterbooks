import { Document, DocumentType } from '../../../domain/entities/Document';
import { IDocumentRepository } from '../../../domain/repositories/IDocumentRepository';
import { IFileStorageService } from '../../../domain/services/IFileStorageService';
import { Result } from '../../../shared/Result';

export interface UploadDocumentRequest {
    companyId: string;
    uploadedByUserId: string;
    file: File;
    type: DocumentType;
}

export interface UploadDocumentResponse {
    document: Document;
    fileUrl: string;
}

export class UploadDocumentUseCase {
    constructor(
        private documentRepository: IDocumentRepository,
        private fileStorageService: IFileStorageService
    ) { }

    async execute(request: UploadDocumentRequest): Promise<Result<UploadDocumentResponse>> {
        try {
            // Validate request
            const validationErrors = Document.validate({
                companyId: request.companyId,
                uploadedByUserId: request.uploadedByUserId,
                filePath: '', // Will be set after upload
                originalFilename: request.file.name,
                type: request.type
            });

            if (validationErrors.length > 0) {
                return Result.fail<UploadDocumentResponse>(validationErrors.join(', '));
            }

            // Validate file type
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
            if (!allowedTypes.includes(request.file.type)) {
                return Result.fail<UploadDocumentResponse>('Invalid file type. Only PDF, JPEG, and PNG files are allowed.');
            }

            // Validate file size (10MB limit)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (request.file.size > maxSize) {
                return Result.fail<UploadDocumentResponse>('File size too large. Maximum size is 10MB.');
            }

            // Upload file to storage
            const uploadResult = await this.fileStorageService.uploadFile(
                request.file,
                `documents/${request.companyId}/${Date.now()}_${request.file.name}`
            );

            if (uploadResult.isFailure) {
                return Result.fail<UploadDocumentResponse>(`Failed to upload file: ${uploadResult.error}`);
            }

            // Create document entity
            const document = Document.create({
                companyId: request.companyId,
                uploadedByUserId: request.uploadedByUserId,
                filePath: uploadResult.value.filePath,
                originalFilename: request.file.name,
                type: request.type
            });

            // Save document to repository
            const savedDocument = await this.documentRepository.save(document);

            return Result.ok<UploadDocumentResponse>({
                document: savedDocument,
                fileUrl: uploadResult.value.fileUrl
            });
        } catch (error) {
            return Result.fail<UploadDocumentResponse>(`Failed to upload document: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
} 