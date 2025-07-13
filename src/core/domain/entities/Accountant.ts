export interface AccountantProps {
    id?: string;
    userId: string;
    fullName: string;
    isActive?: boolean;
}

export class Accountant {
    private readonly _id: string;
    private readonly _userId: string;
    private _fullName: string;
    private _isActive: boolean;

    constructor(props: AccountantProps) {
        this._id = props.id || crypto.randomUUID();
        this._userId = props.userId;
        this._fullName = props.fullName;
        this._isActive = props.isActive ?? true;
    }

    // Getters
    get id(): string { return this._id; }
    get userId(): string { return this._userId; }
    get fullName(): string { return this._fullName; }
    get isActive(): boolean { return this._isActive; }

    // Business methods
    activate(): void {
        this._isActive = true;
    }

    deactivate(): void {
        this._isActive = false;
    }

    updateFullName(fullName: string): void {
        if (!fullName.trim()) {
            throw new Error('Full name cannot be empty');
        }
        this._fullName = fullName.trim();
    }

    // Validation
    static validate(props: Partial<AccountantProps>): string[] {
        const errors: string[] = [];

        if (!props.userId) {
            errors.push('User ID is required');
        }

        if (!props.fullName?.trim()) {
            errors.push('Full name is required');
        }

        return errors;
    }

    // Factory method
    static create(props: Omit<AccountantProps, 'id'>): Accountant {
        const errors = Accountant.validate(props);
        if (errors.length > 0) {
            throw new Error(`Invalid accountant data: ${errors.join(', ')}`);
        }

        return new Accountant(props);
    }

    // Serialization
    toJSON() {
        return {
            id: this._id,
            userId: this._userId,
            fullName: this._fullName,
            isActive: this._isActive
        };
    }
} 