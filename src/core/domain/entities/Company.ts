export enum CompanyType {
    INDEPENDENT_WORKER = 'INDEPENDENT_WORKER',
    PROFESSIONAL_SERVICES = 'PROFESSIONAL_SERVICES',
    SMALL_BUSINESS = 'SMALL_BUSINESS'
}

export interface CompanyProps {
    id?: string;
    userId: string;
    assignedAccountantId?: string;
    name: string;
    type: CompanyType;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Company {
    private readonly _id: string;
    private readonly _userId: string;
    private _assignedAccountantId?: string;
    private _name: string;
    private _type: CompanyType;
    private _isActive: boolean;
    private readonly _createdAt: Date;
    private _updatedAt: Date;

    constructor(props: CompanyProps) {
        this._id = props.id || crypto.randomUUID();
        this._userId = props.userId;
        this._assignedAccountantId = props.assignedAccountantId;
        this._name = props.name;
        this._type = props.type;
        this._isActive = props.isActive ?? true;
        this._createdAt = props.createdAt || new Date();
        this._updatedAt = props.updatedAt || new Date();
    }

    // Getters
    get id(): string { return this._id; }
    get userId(): string { return this._userId; }
    get assignedAccountantId(): string | undefined { return this._assignedAccountantId; }
    get name(): string { return this._name; }
    get type(): CompanyType { return this._type; }
    get isActive(): boolean { return this._isActive; }
    get createdAt(): Date { return this._createdAt; }
    get updatedAt(): Date { return this._updatedAt; }

    // Business methods
    assignAccountant(accountantId: string): void {
        this._assignedAccountantId = accountantId;
        this._updatedAt = new Date();
    }

    unassignAccountant(): void {
        this._assignedAccountantId = undefined;
        this._updatedAt = new Date();
    }

    activate(): void {
        this._isActive = true;
        this._updatedAt = new Date();
    }

    deactivate(): void {
        this._isActive = false;
        this._updatedAt = new Date();
    }

    updateName(name: string): void {
        if (!name.trim()) {
            throw new Error('Company name cannot be empty');
        }
        this._name = name.trim();
        this._updatedAt = new Date();
    }

    // Validation
    static validate(props: Partial<CompanyProps>): string[] {
        const errors: string[] = [];

        if (!props.userId) {
            errors.push('User ID is required');
        }

        if (!props.name?.trim()) {
            errors.push('Company name is required');
        }

        if (!props.type) {
            errors.push('Company type is required');
        }

        return errors;
    }

    // Factory method
    static create(props: Omit<CompanyProps, 'id' | 'createdAt' | 'updatedAt'>): Company {
        const errors = Company.validate(props);
        if (errors.length > 0) {
            throw new Error(`Invalid company data: ${errors.join(', ')}`);
        }

        return new Company(props);
    }

    // Serialization
    toJSON() {
        return {
            id: this._id,
            userId: this._userId,
            assignedAccountantId: this._assignedAccountantId,
            name: this._name,
            type: this._type,
            isActive: this._isActive,
            createdAt: this._createdAt,
            updatedAt: this._updatedAt
        };
    }
} 