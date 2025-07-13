export enum DocumentStatus {
    PENDING_REVIEW = 'PENDING_REVIEW',
    IN_PROGRESS = 'IN_PROGRESS',
    USER_INPUT_NEEDED = 'USER_INPUT_NEEDED',
    COMPLETED = 'COMPLETED'
}

export enum DocumentType {
    INVOICE = 'INVOICE',
    RECEIPT = 'RECEIPT',
    BANK_STATEMENT = 'BANK_STATEMENT',
    OTHER = 'OTHER'
}

export interface DocumentProps {
    id?: string;
    companyId: string;
    uploadedByUserId: string;
    filePath: string;
    originalFilename: string;
    status?: DocumentStatus;
    type: DocumentType;
    uploadedAt?: Date;
}

export class Document {
    private readonly _id: string;
    private readonly _companyId: string;
    private readonly _uploadedByUserId: string;
    private readonly _filePath: string;
    private readonly _originalFilename: string;
    private _status: DocumentStatus;
    private readonly _type: DocumentType;
    private readonly _uploadedAt: Date;

    constructor(props: DocumentProps) {
        this._id = props.id || crypto.randomUUID();
        this._companyId = props.companyId;
        this._uploadedByUserId = props.uploadedByUserId;
        this._filePath = props.filePath;
        this._originalFilename = props.originalFilename;
        this._status = props.status || DocumentStatus.PENDING_REVIEW;
        this._type = props.type;
        this._uploadedAt = props.uploadedAt || new Date();
    }

    // Getters
    get id(): string { return this._id; }
    get companyId(): string { return this._companyId; }
    get uploadedByUserId(): string { return this._uploadedByUserId; }
    get filePath(): string { return this._filePath; }
    get originalFilename(): string { return this._originalFilename; }
    get status(): DocumentStatus { return this._status; }
    get type(): DocumentType { return this._type; }
    get uploadedAt(): Date { return this._uploadedAt; }

    // Business methods
    markInProgress(): void {
        if (this._status !== DocumentStatus.PENDING_REVIEW) {
            throw new Error('Document must be in PENDING_REVIEW status to mark as IN_PROGRESS');
        }
        this._status = DocumentStatus.IN_PROGRESS;
    }

    markCompleted(): void {
        if (this._status !== DocumentStatus.IN_PROGRESS) {
            throw new Error('Document must be in IN_PROGRESS status to mark as COMPLETED');
        }
        this._status = DocumentStatus.COMPLETED;
    }

    requestUserInput(): void {
        if (this._status !== DocumentStatus.IN_PROGRESS) {
            throw new Error('Document must be in IN_PROGRESS status to request user input');
        }
        this._status = DocumentStatus.USER_INPUT_NEEDED;
    }

    resetToPending(): void {
        this._status = DocumentStatus.PENDING_REVIEW;
    }

    // Status checks
    isPending(): boolean {
        return this._status === DocumentStatus.PENDING_REVIEW;
    }

    isInProgress(): boolean {
        return this._status === DocumentStatus.IN_PROGRESS;
    }

    isCompleted(): boolean {
        return this._status === DocumentStatus.COMPLETED;
    }

    needsUserInput(): boolean {
        return this._status === DocumentStatus.USER_INPUT_NEEDED;
    }

    // Validation
    static validate(props: Partial<DocumentProps>): string[] {
        const errors: string[] = [];

        if (!props.companyId) {
            errors.push('Company ID is required');
        }

        if (!props.uploadedByUserId) {
            errors.push('Uploaded by user ID is required');
        }

        if (!props.filePath?.trim()) {
            errors.push('File path is required');
        }

        if (!props.originalFilename?.trim()) {
            errors.push('Original filename is required');
        }

        if (!props.type) {
            errors.push('Document type is required');
        }

        return errors;
    }

    // Factory method
    static create(props: Omit<DocumentProps, 'id' | 'status' | 'uploadedAt'>): Document {
        const errors = Document.validate(props);
        if (errors.length > 0) {
            throw new Error(`Invalid document data: ${errors.join(', ')}`);
        }

        return new Document(props);
    }

    // Serialization
    toJSON() {
        return {
            id: this._id,
            companyId: this._companyId,
            uploadedByUserId: this._uploadedByUserId,
            filePath: this._filePath,
            originalFilename: this._originalFilename,
            status: this._status,
            type: this._type,
            uploadedAt: this._uploadedAt
        };
    }
} 