import { DocumentStatus, DocumentType } from '@/shared/constants/documents';

export interface Document {
    id: string;
    company_id: string;
    uploaded_by_user_id: string;
    file_path: string;
    original_filename: string;
    status: DocumentStatus;
    type: DocumentType;
    uploaded_at: string;
}

export interface DocumentUploadRequest {
    files: File[];
    type: DocumentType;
}

export interface DocumentUploadResponse {
    data: Document[] | null;
    error: Error | null;
}

export interface DocumentListResponse {
    data: Document[] | null;
    error: Error | null;
}

export interface PaginatedDocumentResponse {
    data: {
        items: Document[];
        total: number;
    } | null;
    error: Error | null;
}

export interface DocumentStatusUpdateRequest {
    document_id: string;
    status: DocumentStatus;
}

export interface DocumentFilters {
    type?: DocumentType;
    status?: DocumentStatus;
    date_from?: string;
    date_to?: string;
} 