
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];


export type DocumentStatus = 'PENDING_REVIEW' | 'IN_PROGRESS' | 'COMPLETED';
export type DocumentType = 'INVOICE' | 'RECEIPT' | 'BANK_STATEMENT' | 'TAX_RETURN' | 'TAX_VOUCHER' | 'TAX_SUMMARY' | 'OTHER';

export const DOCUMENTS_TABLE = 'documents';

export const DOCUMENT_TYPE_FOLDER: Record<DocumentType, string> = {
    INVOICE: 'invoices',
    RECEIPT: 'receipts',
    BANK_STATEMENT: 'bank_statements',
    TAX_RETURN: 'tax_documents/returns',
    TAX_VOUCHER: 'tax_documents/vouchers',
    TAX_SUMMARY: 'tax_documents/summaries',
    OTHER: 'others',
};
