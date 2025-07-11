import { supabase } from './client';
import { Document, DocumentUploadRequest, DocumentListResponse, DocumentStatusUpdateRequest, DocumentFilters, PaginatedDocumentResponse } from '@/interfaces/document';
import { UploadedFile } from '@/interfaces/storage';
import { uploadFiles } from './storage';
import { getCompanyByUserId } from './company';
import { DOCUMENT_TYPE_FOLDER, DOCUMENTS_TABLE, DocumentStatus } from '@/constants/documents';

export const uploadDocuments = async (request: DocumentUploadRequest): Promise<DocumentListResponse> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const company = await getCompanyByUserId(user.id);
        if (!company) throw new Error('Company not found');

        // Dynamically select folder based on document type
        const folder = DOCUMENT_TYPE_FOLDER[request.type];
        const { data: uploadedFiles, error: uploadError } = await uploadFiles(request.files, folder);
        if (uploadError) throw uploadError;

        const documents = (uploadedFiles as UploadedFile[]).map(file => ({
            company_id: company.id,
            uploaded_by_user_id: user.id,
            file_path: file.path,
            original_filename: file.name,
            type: request.type,
            status: 'PENDING_REVIEW' as DocumentStatus
        }));

        const { data, error: insertError } = await supabase
            .from(DOCUMENTS_TABLE)
            .insert(documents)
            .select();

        if (insertError) {
            throw insertError;
        }

        return { data, error: null };
    } catch (error) {
        return { data: null, error: error as Error };
    }
};

export const getDocuments = async (filters?: DocumentFilters): Promise<DocumentListResponse> => {
    try {
        let query = supabase
            .from(DOCUMENTS_TABLE)
            .select('*')
            .order('uploaded_at', { ascending: false });

        if (filters?.type) {
            query = query.eq('type', filters.type);
        }

        if (filters?.status) {
            query = query.eq('status', filters.status);
        }

        if (filters?.date_from) {
            query = query.gte('uploaded_at', filters.date_from);
        }

        if (filters?.date_to) {
            query = query.lte('uploaded_at', filters.date_to);
        }

        const { data } = await query;

        return { data, error: null };
    } catch (error) {
        return { data: null, error: error as Error };
    }
};

export const getPaginatedDocuments = async (
    page: number = 1,
    pageSize: number = 10,
    filters?: DocumentFilters
): Promise<PaginatedDocumentResponse> => {
    try {
        // First, get the total count
        let countQuery = supabase
            .from(DOCUMENTS_TABLE)
            .select('*', { count: 'exact', head: true });

        if (filters?.type) {
            countQuery = countQuery.eq('type', filters.type);
        }

        if (filters?.status) {
            countQuery = countQuery.eq('status', filters.status);
        }

        if (filters?.date_from) {
            countQuery = countQuery.gte('uploaded_at', filters.date_from);
        }

        if (filters?.date_to) {
            countQuery = countQuery.lte('uploaded_at', filters.date_to);
        }

        const { count } = await countQuery;

        // Then, get the paginated data
        let query = supabase
            .from(DOCUMENTS_TABLE)
            .select('*')
            .order('uploaded_at', { ascending: false })
            .range((page - 1) * pageSize, page * pageSize - 1);

        if (filters?.type) {
            query = query.eq('type', filters.type);
        }

        if (filters?.status) {
            query = query.eq('status', filters.status);
        }

        if (filters?.date_from) {
            query = query.gte('uploaded_at', filters.date_from);
        }

        if (filters?.date_to) {
            query = query.lte('uploaded_at', filters.date_to);
        }

        const { data } = await query;

        return {
            data: {
                items: data || [],
                total: count || 0
            },
            error: null
        };
    } catch (error) {
        return { data: null, error: error as Error };
    }
};

export const updateDocumentStatus = async (request: DocumentStatusUpdateRequest): Promise<{ data: Document | null; error: Error | null }> => {
    try {
        const { data } = await supabase
            .from(DOCUMENTS_TABLE)
            .update({ status: request.status })
            .eq('id', request.document_id)
            .select()
            .single();

        return { data, error: null };
    } catch (error) {
        return { data: null, error: error as Error };
    }
};

export const deleteDocument = async (documentId: string): Promise<{ error: Error | null }> => {
    try {
        const { data: document, error: fetchError } = await supabase
            .from(DOCUMENTS_TABLE)
            .select('file_path')
            .eq('id', documentId)
            .single();

        if (fetchError) {
            throw fetchError;
        }

        if (document?.file_path) {
            await supabase.storage
                .from('documents')
                .remove([document.file_path]);
        }

        await supabase
            .from(DOCUMENTS_TABLE)
            .delete()
            .eq('id', documentId);

        return { error: null };
    } catch (error) {
        return { error: error as Error };
    }
};

export const getDocumentDownloadUrl = async (filePath: string): Promise<string | null> => {
    try {
        const { data } = await supabase.storage
            .from('documents')
            .createSignedUrl(filePath, 3600);
        return data?.signedUrl || null;
    } catch {
        return null;
    }
};

export const getDocumentsByUser = async (userId: string, filters?: DocumentFilters): Promise<DocumentListResponse> => {
    try {
        let query = supabase
            .from(DOCUMENTS_TABLE)
            .select('*')
            .eq('uploaded_by_user_id', userId)
            .order('uploaded_at', { ascending: false });

        if (filters?.type) {
            query = query.eq('type', filters.type);
        }

        if (filters?.status) {
            query = query.eq('status', filters.status);
        }

        if (filters?.date_from) {
            query = query.gte('uploaded_at', filters.date_from);
        }

        if (filters?.date_to) {
            query = query.lte('uploaded_at', filters.date_to);
        }

        const { data } = await query;

        return { data, error: null };
    } catch (error) {
        return { data: null, error: error as Error };
    }
}; 