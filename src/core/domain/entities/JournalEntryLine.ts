export interface JournalEntryLineProps {
    id?: string;
    journalEntryId: string;
    accountId: string;
    type: 'DEBIT' | 'CREDIT';
    amount: number;
}

export class JournalEntryLine {
    private readonly _id: string;
    private readonly _journalEntryId: string;
    private readonly _accountId: string;
    private readonly _type: 'DEBIT' | 'CREDIT';
    private readonly _amount: number;

    constructor(props: JournalEntryLineProps) {
        this._id = props.id || crypto.randomUUID();
        this._journalEntryId = props.journalEntryId;
        this._accountId = props.accountId;
        this._type = props.type;
        this._amount = props.amount;
    }

    // Getters
    get id(): string { return this._id; }
    get journalEntryId(): string { return this._journalEntryId; }
    get accountId(): string { return this._accountId; }
    get type(): 'DEBIT' | 'CREDIT' { return this._type; }
    get amount(): number { return this._amount; }

    // Validation
    static validate(props: Partial<JournalEntryLineProps>): string[] {
        const errors: string[] = [];

        if (!props.journalEntryId) {
            errors.push('Journal entry ID is required');
        }

        if (!props.accountId) {
            errors.push('Account ID is required');
        }

        if (!props.type || !['DEBIT', 'CREDIT'].includes(props.type)) {
            errors.push('Type must be either DEBIT or CREDIT');
        }

        if (typeof props.amount !== 'number' || props.amount <= 0) {
            errors.push('Amount must be a positive number');
        }

        return errors;
    }

    // Factory method
    static create(props: Omit<JournalEntryLineProps, 'id'>): JournalEntryLine {
        const errors = JournalEntryLine.validate(props);
        if (errors.length > 0) {
            throw new Error(`Invalid journal entry line data: ${errors.join(', ')}`);
        }

        return new JournalEntryLine(props);
    }

    // Serialization
    toJSON() {
        return {
            id: this._id,
            journalEntryId: this._journalEntryId,
            accountId: this._accountId,
            type: this._type,
            amount: this._amount
        };
    }
} 