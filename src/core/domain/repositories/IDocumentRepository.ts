import { Document } from '../entities/Document';
import { DocumentStatus, DocumentType } from '../entities/Document';

export interface IDocumentRepository {
    findById(id: string): Promise<Document | null>;
    findByCompanyId(companyId: string): Promise<Document[]>;
    findByStatus(status: DocumentStatus): Promise<Document[]>;
    findByType(type: DocumentType): Promise<Document[]>;
    findByCompanyIdAndStatus(companyId: string, status: DocumentStatus): Promise<Document[]>;
    save(document: Document): Promise<Document>;
    update(document: Document): Promise<Document>;
    delete(id: string): Promise<void>;
    findAll(): Promise<Document[]>;
    findPendingDocuments(): Promise<Document[]>;
    findCompletedDocuments(): Promise<Document[]>;
} 