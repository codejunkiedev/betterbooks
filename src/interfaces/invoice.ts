import { UploadedFile } from "./storage";

export type InvoiceStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface InvoiceFile {
    name: string;
    url: string;
}

export interface InvoiceData {
    id: string;
    user_id: string;
    file: InvoiceFile;
    status: InvoiceStatus;
    data: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}

export interface CreateInvoiceData {
    files: UploadedFile[] | null;
}

export interface UpdateInvoiceData extends Partial<CreateInvoiceData> {
    status?: InvoiceStatus;
} 