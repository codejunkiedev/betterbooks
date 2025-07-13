import { createClient } from '@supabase/supabase-js';
import { Document, DocumentStatus, DocumentType } from '../../core/domain/entities/Document';
import { IDocumentRepository } from '../../core/domain/repositories/IDocumentRepository';

export class SupabaseDocumentRepository implements IDocumentRepository {
    private supabase;

    constructor() {
        this.supabase = createClient(
            import.meta.env.VITE_SUPABASE_URL,
            import.meta.env.VITE_SUPABASE_ANON_KEY
        );
    }

    async findById(id: string): Promise<Document | null> {
        try {
            const { data, error } = await this.supabase
                .from('documents')
                .select('*')
                .eq('id', id)
                .single();

            if (error || !data) {
                return null;
            }

            return new Document({
                id: data.id,
                companyId: data.company_id,
                uploadedByUserId: data.uploaded_by_user_id,
                filePath: data.file_path,
                originalFilename: data.original_filename,
                status: data.status as DocumentStatus,
                type: data.type as DocumentType,
                uploadedAt: new Date(data.uploaded_at)
            });
        } catch (error) {
            console.error('Error finding document by ID:', error);
            return null;
        }
    }

    async findByCompanyId(companyId: string): Promise<Document[]> {
        try {
            const { data, error } = await this.supabase
                .from('documents')
                .select('*')
                .eq('company_id', companyId)
                .order('uploaded_at', { ascending: false });

            if (error || !data) {
                return [];
            }

            return data.map(row => new Document({
                id: row.id,
                companyId: row.company_id,
                uploadedByUserId: row.uploaded_by_user_id,
                filePath: row.file_path,
                originalFilename: row.original_filename,
                status: row.status as DocumentStatus,
                type: row.type as DocumentType,
                uploadedAt: new Date(row.uploaded_at)
            }));
        } catch (error) {
            console.error('Error finding documents by company ID:', error);
            return [];
        }
    }

    async findByStatus(status: DocumentStatus): Promise<Document[]> {
        try {
            const { data, error } = await this.supabase
                .from('documents')
                .select('*')
                .eq('status', status);

            if (error || !data) {
                return [];
            }

            return data.map(row => new Document({
                id: row.id,
                companyId: row.company_id,
                uploadedByUserId: row.uploaded_by_user_id,
                filePath: row.file_path,
                originalFilename: row.original_filename,
                status: row.status as DocumentStatus,
                type: row.type as DocumentType,
                uploadedAt: new Date(row.uploaded_at)
            }));
        } catch (error) {
            console.error('Error finding documents by status:', error);
            return [];
        }
    }

    async findByType(type: DocumentType): Promise<Document[]> {
        try {
            const { data, error } = await this.supabase
                .from('documents')
                .select('*')
                .eq('type', type);

            if (error || !data) {
                return [];
            }

            return data.map(row => new Document({
                id: row.id,
                companyId: row.company_id,
                uploadedByUserId: row.uploaded_by_user_id,
                filePath: row.file_path,
                originalFilename: row.original_filename,
                status: row.status as DocumentStatus,
                type: row.type as DocumentType,
                uploadedAt: new Date(row.uploaded_at)
            }));
        } catch (error) {
            console.error('Error finding documents by type:', error);
            return [];
        }
    }

    async findByCompanyIdAndStatus(companyId: string, status: DocumentStatus): Promise<Document[]> {
        try {
            const { data, error } = await this.supabase
                .from('documents')
                .select('*')
                .eq('company_id', companyId)
                .eq('status', status);

            if (error || !data) {
                return [];
            }

            return data.map(row => new Document({
                id: row.id,
                companyId: row.company_id,
                uploadedByUserId: row.uploaded_by_user_id,
                filePath: row.file_path,
                originalFilename: row.original_filename,
                status: row.status as DocumentStatus,
                type: row.type as DocumentType,
                uploadedAt: new Date(row.uploaded_at)
            }));
        } catch (error) {
            console.error('Error finding documents by company ID and status:', error);
            return [];
        }
    }

    async save(document: Document): Promise<Document> {
        try {
            const documentData = document.toJSON();

            const { data, error } = await this.supabase
                .from('documents')
                .insert({
                    id: documentData.id,
                    company_id: documentData.companyId,
                    uploaded_by_user_id: documentData.uploadedByUserId,
                    file_path: documentData.filePath,
                    original_filename: documentData.originalFilename,
                    status: documentData.status,
                    type: documentData.type,
                    uploaded_at: documentData.uploadedAt.toISOString()
                })
                .select()
                .single();

            if (error) {
                throw new Error(`Failed to save document: ${error.message}`);
            }

            return new Document({
                id: data.id,
                companyId: data.company_id,
                uploadedByUserId: data.uploaded_by_user_id,
                filePath: data.file_path,
                originalFilename: data.original_filename,
                status: data.status as DocumentStatus,
                type: data.type as DocumentType,
                uploadedAt: new Date(data.uploaded_at)
            });
        } catch (error) {
            throw new Error(`Failed to save document: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async update(document: Document): Promise<Document> {
        try {
            const documentData = document.toJSON();

            const { data, error } = await this.supabase
                .from('documents')
                .update({
                    status: documentData.status
                })
                .eq('id', documentData.id)
                .select()
                .single();

            if (error) {
                throw new Error(`Failed to update document: ${error.message}`);
            }

            return new Document({
                id: data.id,
                companyId: data.company_id,
                uploadedByUserId: data.uploaded_by_user_id,
                filePath: data.file_path,
                originalFilename: data.original_filename,
                status: data.status as DocumentStatus,
                type: data.type as DocumentType,
                uploadedAt: new Date(data.uploaded_at)
            });
        } catch (error) {
            throw new Error(`Failed to update document: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async delete(id: string): Promise<void> {
        try {
            const { error } = await this.supabase
                .from('documents')
                .delete()
                .eq('id', id);

            if (error) {
                throw new Error(`Failed to delete document: ${error.message}`);
            }
        } catch (error) {
            throw new Error(`Failed to delete document: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async findAll(): Promise<Document[]> {
        try {
            const { data, error } = await this.supabase
                .from('documents')
                .select('*')
                .order('uploaded_at', { ascending: false });

            if (error || !data) {
                return [];
            }

            return data.map(row => new Document({
                id: row.id,
                companyId: row.company_id,
                uploadedByUserId: row.uploaded_by_user_id,
                filePath: row.file_path,
                originalFilename: row.original_filename,
                status: row.status as DocumentStatus,
                type: row.type as DocumentType,
                uploadedAt: new Date(row.uploaded_at)
            }));
        } catch (error) {
            console.error('Error finding all documents:', error);
            return [];
        }
    }

    async findPendingDocuments(): Promise<Document[]> {
        return this.findByStatus(DocumentStatus.PENDING_REVIEW);
    }

    async findCompletedDocuments(): Promise<Document[]> {
        return this.findByStatus(DocumentStatus.COMPLETED);
    }
} 