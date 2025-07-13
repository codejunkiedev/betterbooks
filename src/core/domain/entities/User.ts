export enum UserRole {
    USER = 'USER',           // Business owners/clients
    ACCOUNTANT = 'ACCOUNTANT', // Service providers
    ADMIN = 'ADMIN'          // Platform administrators
}

export enum UserStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED'
}

export interface UserProps {
    id?: string;
    email: string;
    fullName: string;
    role: UserRole;
    status?: UserStatus;
    avatarUrl?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export class User {
    private readonly _id: string;
    private _email: string;
    private _fullName: string;
    private readonly _role: UserRole;
    private _status: UserStatus;
    private _avatarUrl?: string;
    private readonly _createdAt: Date;
    private _updatedAt: Date;

    constructor(props: UserProps) {
        this._id = props.id || crypto.randomUUID();
        this._email = props.email;
        this._fullName = props.fullName;
        this._role = props.role;
        this._status = props.status || UserStatus.ACTIVE;
        this._avatarUrl = props.avatarUrl;
        this._createdAt = props.createdAt || new Date();
        this._updatedAt = props.updatedAt || new Date();
    }

    // Getters
    get id(): string { return this._id; }
    get email(): string { return this._email; }
    get fullName(): string { return this._fullName; }
    get role(): UserRole { return this._role; }
    get status(): UserStatus { return this._status; }
    get avatarUrl(): string | undefined { return this._avatarUrl; }
    get createdAt(): Date { return this._createdAt; }
    get updatedAt(): Date { return this._updatedAt; }

    // Role checks
    isUser(): boolean { return this._role === UserRole.USER; }
    isAccountant(): boolean { return this._role === UserRole.ACCOUNTANT; }
    isAdmin(): boolean { return this._role === UserRole.ADMIN; }
    isActive(): boolean { return this._status === UserStatus.ACTIVE; }

    // Business methods
    activate(): void {
        this._status = UserStatus.ACTIVE;
        this._updatedAt = new Date();
    }

    deactivate(): void {
        this._status = UserStatus.INACTIVE;
        this._updatedAt = new Date();
    }

    suspend(): void {
        this._status = UserStatus.SUSPENDED;
        this._updatedAt = new Date();
    }

    updateProfile(fullName: string, avatarUrl?: string): void {
        if (!fullName.trim()) {
            throw new Error('Full name cannot be empty');
        }
        this._fullName = fullName.trim();
        this._avatarUrl = avatarUrl;
        this._updatedAt = new Date();
    }

    updateEmail(email: string): void {
        if (!this.isValidEmail(email)) {
            throw new Error('Invalid email format');
        }
        this._email = email.toLowerCase();
        this._updatedAt = new Date();
    }

    // Validation
    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static validate(props: Partial<UserProps>): string[] {
        const errors: string[] = [];

        if (!props.email?.trim()) {
            errors.push('Email is required');
        } else if (!new User(props as UserProps).isValidEmail(props.email)) {
            errors.push('Invalid email format');
        }

        if (!props.fullName?.trim()) {
            errors.push('Full name is required');
        }

        if (!props.role) {
            errors.push('User role is required');
        }

        return errors;
    }

    // Factory method
    static create(props: Omit<UserProps, 'id' | 'createdAt' | 'updatedAt'>): User {
        const errors = User.validate(props);
        if (errors.length > 0) {
            throw new Error(`Invalid user data: ${errors.join(', ')}`);
        }

        return new User(props);
    }

    // Serialization
    toJSON() {
        return {
            id: this._id,
            email: this._email,
            fullName: this._fullName,
            role: this._role,
            status: this._status,
            avatarUrl: this._avatarUrl,
            createdAt: this._createdAt,
            updatedAt: this._updatedAt
        };
    }
} 