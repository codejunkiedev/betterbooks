import { JournalEntryLine } from './JournalEntryLine';

export interface JournalEntryProps {
    id?: string;
    companyId: string;
    entryDate: Date;
    description: string;
    createdByAccountantId: string;
    sourceDocumentId?: string;
    isAdjustingEntry?: boolean;
    createdAt?: Date;
    lines?: JournalEntryLine[];
}

export class JournalEntry {
    private readonly _id: string;
    private readonly _companyId: string;
    private readonly _entryDate: Date;
    private _description: string;
    private readonly _createdByAccountantId: string;
    private readonly _sourceDocumentId?: string;
    private readonly _isAdjustingEntry: boolean;
    private readonly _createdAt: Date;
    private _lines: JournalEntryLine[];

    constructor(props: JournalEntryProps) {
        this._id = props.id || crypto.randomUUID();
        this._companyId = props.companyId;
        this._entryDate = props.entryDate;
        this._description = props.description;
        this._createdByAccountantId = props.createdByAccountantId;
        this._sourceDocumentId = props.sourceDocumentId;
        this._isAdjustingEntry = props.isAdjustingEntry || false;
        this._createdAt = props.createdAt || new Date();
        this._lines = props.lines || [];
    }

    // Getters
    get id(): string { return this._id; }
    get companyId(): string { return this._companyId; }
    get entryDate(): Date { return this._entryDate; }
    get description(): string { return this._description; }
    get createdByAccountantId(): string { return this._createdByAccountantId; }
    get sourceDocumentId(): string | undefined { return this._sourceDocumentId; }
    get isAdjustingEntry(): boolean { return this._isAdjustingEntry; }
    get createdAt(): Date { return this._createdAt; }
    get lines(): JournalEntryLine[] { return [...this._lines]; }

    // Business methods
    addLine(line: JournalEntryLine): void {
        this._lines.push(line);
    }

    removeLine(lineId: string): void {
        this._lines = this._lines.filter(line => line.id !== lineId);
    }

    updateDescription(description: string): void {
        if (!description.trim()) {
            throw new Error('Journal entry description cannot be empty');
        }
        this._description = description.trim();
    }

    // Validation methods
    validateDoubleEntry(): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (this._lines.length < 2) {
            errors.push('Journal entry must have at least two lines');
        }

        const totalDebits = this._lines
            .filter(line => line.type === 'DEBIT')
            .reduce((sum, line) => sum + Number(line.amount), 0);

        const totalCredits = this._lines
            .filter(line => line.type === 'CREDIT')
            .reduce((sum, line) => sum + Number(line.amount), 0);

        if (Math.abs(totalDebits - totalCredits) > 0.01) {
            errors.push(`Total debits (${totalDebits}) must equal total credits (${totalCredits})`);
        }

        // Check for at least one debit and one credit
        const hasDebit = this._lines.some(line => line.type === 'DEBIT');
        const hasCredit = this._lines.some(line => line.type === 'CREDIT');

        if (!hasDebit) {
            errors.push('Journal entry must have at least one debit line');
        }

        if (!hasCredit) {
            errors.push('Journal entry must have at least one credit line');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    getTotalDebits(): number {
        return this._lines
            .filter(line => line.type === 'DEBIT')
            .reduce((sum, line) => sum + Number(line.amount), 0);
    }

    getTotalCredits(): number {
        return this._lines
            .filter(line => line.type === 'CREDIT')
            .reduce((sum, line) => sum + Number(line.amount), 0);
    }

    // Validation
    static validate(props: Partial<JournalEntryProps>): string[] {
        const errors: string[] = [];

        if (!props.companyId) {
            errors.push('Company ID is required');
        }

        if (!props.entryDate) {
            errors.push('Entry date is required');
        }

        if (!props.description?.trim()) {
            errors.push('Description is required');
        }

        if (!props.createdByAccountantId) {
            errors.push('Created by accountant ID is required');
        }

        return errors;
    }

    // Factory method
    static create(props: Omit<JournalEntryProps, 'id' | 'createdAt'>): JournalEntry {
        const errors = JournalEntry.validate(props);
        if (errors.length > 0) {
            throw new Error(`Invalid journal entry data: ${errors.join(', ')}`);
        }

        return new JournalEntry(props);
    }

    // Serialization
    toJSON() {
        return {
            id: this._id,
            companyId: this._companyId,
            entryDate: this._entryDate,
            description: this._description,
            createdByAccountantId: this._createdByAccountantId,
            sourceDocumentId: this._sourceDocumentId,
            isAdjustingEntry: this._isAdjustingEntry,
            createdAt: this._createdAt,
            lines: this._lines.map(line => line.toJSON())
        };
    }
} 