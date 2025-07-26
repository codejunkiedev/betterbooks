import { supabase } from './client';
import { Document, DocumentUploadRequest, DocumentListResponse, DocumentStatusUpdateRequest, DocumentFilters, PaginatedDocumentResponse } from '@/shared/types/document';
import { UploadedFile } from '@/shared/types/storage';
import { uploadFiles } from './storage';
import { getCompanyByUserId } from './company';
import { DOCUMENT_TYPE_FOLDER, DOCUMENTS_TABLE, DocumentStatus } from '@/shared/constants/documents';
import { createActivityLog } from './activity';

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

        // Log activity for each uploaded document
        for (const doc of documents) {
            await createActivityLog(
                company.id,
                user.id,
                'DOCUMENT_UPLOADED',
                {
                    filename: doc.original_filename,
                    document_type: doc.type,
                    document_id: doc.file_path
                }
            );
        }

        return { data, error: null };
    } catch (error) {
        return { data: null, error: error as Error };
    }
};

// Upload documents for a specific company (for accountants uploading for clients)
export const uploadDocumentsForCompany = async (
    request: DocumentUploadRequest & { companyId: string }
): Promise<DocumentListResponse> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Verify this is an accountant and they have access to this company
        const { data: accountant, error: accountantError } = await supabase
            .from('accountants')
            .select('id')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .maybeSingle();

        if (accountantError || !accountant) {
            throw new Error('Only accountants can upload documents for clients');
        }

        // Verify the company is assigned to this accountant
        const { data: company, error: companyError } = await supabase
            .from('companies')
            .select('id')
            .eq('id', request.companyId)
            .eq('assigned_accountant_id', accountant.id)
            .maybeSingle();

        if (companyError || !company) {
            throw new Error('Company not found or not assigned to this accountant');
        }

        // Dynamically select folder based on document type
        const folder = DOCUMENT_TYPE_FOLDER[request.type];
        const { data: uploadedFiles, error: uploadError } = await uploadFiles(request.files, folder);
        if (uploadError) throw uploadError;

        const documents = (uploadedFiles as UploadedFile[]).map(file => ({
            company_id: request.companyId,
            uploaded_by_user_id: user.id,
            file_path: file.path,
            original_filename: file.name,
            type: request.type,
            status: 'COMPLETED' as DocumentStatus // Tax documents uploaded by accountants are automatically completed
        }));

        const { data, error: insertError } = await supabase
            .from(DOCUMENTS_TABLE)
            .insert(documents)
            .select();

        if (insertError) {
            throw insertError;
        }

        // Log activity for each uploaded document
        for (const doc of documents) {
            await createActivityLog(
                request.companyId,
                user.id,
                'DOCUMENT_UPLOADED',
                {
                    filename: doc.original_filename,
                    document_type: doc.type,
                    document_id: doc.file_path
                }
            );
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
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data: document, error: fetchError } = await supabase
            .from(DOCUMENTS_TABLE)
            .select('file_path, company_id, original_filename')
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

        // Log activity for document deletion
        if (document?.company_id) {
            await createActivityLog(
                document.company_id,
                user.id,
                'DOCUMENT_DELETED',
                {
                    filename: document.original_filename,
                    document_id: documentId
                }
            );
        }

        return { error: null };
    } catch (error) {
        return { error: error as Error };
    }
};

export const getDocumentById = async (documentId: string): Promise<{ data: Document | null; error: Error | null }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from(DOCUMENTS_TABLE)
            .select('*')
            .eq('id', documentId)
            .maybeSingle();

        if (error) throw error;

        return { data, error: null };
    } catch (error) {
        return { data: null, error: error as Error };
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

// Get documents by company ID (for accountants to view client documents)
export const getDocumentsByCompanyId = async (companyId: string, filters?: DocumentFilters): Promise<DocumentListResponse> => {
    try {
        let query = supabase
            .from(DOCUMENTS_TABLE)
            .select('*')
            .eq('company_id', companyId)
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

// Get bank statements for a specific company
export const getBankStatementsByCompanyId = async (companyId: string): Promise<DocumentListResponse> => {
    return getDocumentsByCompanyId(companyId, { type: 'BANK_STATEMENT' });
};

// Download multiple documents as ZIP
export const downloadDocumentsAsZip = async (documents: Document[], zipFileName: string = 'documents.zip'): Promise<void> => {
    try {
        // Dynamically import JSZip
        const JSZip = (await import('jszip')).default;

        const zip = new JSZip();

        // Add each document to the ZIP
        for (const doc of documents) {
            try {
                const downloadUrl = await getDocumentDownloadUrl(doc.file_path);
                if (downloadUrl) {
                    const response = await fetch(downloadUrl);
                    const blob = await response.blob();
                    zip.file(doc.original_filename, blob);
                }
            } catch (error) {
                console.error(`Error adding ${doc.original_filename} to ZIP:`, error);
                // Continue with other files even if one fails
            }
        }

        // Generate the ZIP file
        const content = await zip.generateAsync({ type: 'blob' });

        // Create download link
        const url = window.URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = url;
        link.download = zipFileName;
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error creating ZIP file:', error);
        throw new Error('Failed to create ZIP file');
    }
};

// Get pending documents count for clients assigned to an accountant
export const getPendingDocumentsCountForClients = async (): Promise<{ [companyId: string]: number }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // First get the accountant record for the current user
        const { data: accountant, error: accountantError } = await supabase
            .from('accountants')
            .select('id')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .maybeSingle();

        if (accountantError || !accountant) {
            throw new Error('Accountant record not found');
        }

        // Get all companies assigned to this accountant
        const { data: companies, error: companiesError } = await supabase
            .from('companies')
            .select('id')
            .eq('assigned_accountant_id', accountant.id)
            .eq('is_active', true);

        if (companiesError) {
            throw companiesError;
        }

        if (!companies || companies.length === 0) {
            return {};
        }

        // Get pending documents count for each company
        const { data: pendingDocuments, error: documentsError } = await supabase
            .from('documents')
            .select('company_id, status')
            .in('company_id', companies.map(c => c.id))
            .eq('status', 'PENDING_REVIEW');

        if (documentsError) {
            throw documentsError;
        }

        // Count pending documents per company
        const pendingCounts: { [companyId: string]: number } = {};
        companies.forEach(company => {
            pendingCounts[company.id] = 0;
        });

        pendingDocuments?.forEach(doc => {
            if (pendingCounts[doc.company_id] !== undefined) {
                pendingCounts[doc.company_id]++;
            }
        });

        return pendingCounts;
    } catch (error) {
        console.error('Error fetching pending documents count:', error);
        throw error;
    }
}; 