// User and Authentication Enums
export enum UserRole {
    USER = 'USER',
    ACCOUNTANT = 'ACCOUNTANT',
    ADMIN = 'ADMIN'
}

export enum AuthStatus {
    AUTHENTICATED = 'AUTHENTICATED',
    UNAUTHENTICATED = 'UNAUTHENTICATED',
    LOADING = 'LOADING'
}

// Company and Business Enums
export enum CompanyType {
    SOLE_PROPRIETORSHIP = 'SOLE_PROPRIETORSHIP',
    PARTNERSHIP = 'PARTNERSHIP',
    CORPORATION = 'CORPORATION',
    LLC = 'LLC',
    NON_PROFIT = 'NON_PROFIT'
}

export enum CompanyStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    PENDING = 'PENDING',
    SUSPENDED = 'SUSPENDED'
}

// Document and File Enums
export enum DocumentStatus {
    PENDING_REVIEW = 'PENDING_REVIEW',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    REJECTED = 'REJECTED',
    ARCHIVED = 'ARCHIVED'
}

export enum DocumentType {
    INVOICE = 'INVOICE',
    RECEIPT = 'RECEIPT',
    BANK_STATEMENT = 'BANK_STATEMENT',
    EXPENSE_REPORT = 'EXPENSE_REPORT',
    CONTRACT = 'CONTRACT',
    OTHER = 'OTHER'
}

export enum FileType {
    PDF = 'application/pdf',
    IMAGE = 'image/*',
    EXCEL = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    WORD = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
}

// Accounting Enums
export enum AccountType {
    ASSET = 'ASSET',
    LIABILITY = 'LIABILITY',
    EQUITY = 'EQUITY',
    REVENUE = 'REVENUE',
    EXPENSE = 'EXPENSE'
}

export enum TransactionType {
    DEBIT = 'DEBIT',
    CREDIT = 'CREDIT'
}

export enum JournalEntryStatus {
    DRAFT = 'DRAFT',
    POSTED = 'POSTED',
    VOID = 'VOID'
}

// Activity and Notification Enums
export enum ActivityType {
    USER_LOGIN = 'USER_LOGIN',
    USER_LOGOUT = 'USER_LOGOUT',
    DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED',
    DOCUMENT_PROCESSED = 'DOCUMENT_PROCESSED',
    JOURNAL_ENTRY_CREATED = 'JOURNAL_ENTRY_CREATED',
    COMPANY_CREATED = 'COMPANY_CREATED',
    COMPANY_ACTIVATED = 'COMPANY_ACTIVATED',
    COMPANY_DEACTIVATED = 'COMPANY_DEACTIVATED',
    PROFILE_UPDATED = 'PROFILE_UPDATED',
    PASSWORD_CHANGED = 'PASSWORD_CHANGED'
}

export enum NotificationType {
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR',
    WARNING = 'WARNING',
    INFO = 'INFO'
}

// UI and Navigation Enums
export enum RouteType {
    PUBLIC = 'PUBLIC',
    PROTECTED = 'PROTECTED',
    ADMIN_ONLY = 'ADMIN_ONLY',
    ACCOUNTANT_ONLY = 'ACCOUNTANT_ONLY'
}

export enum SidebarState {
    EXPANDED = 'EXPANDED',
    COLLAPSED = 'COLLAPSED'
}

export enum LoadingState {
    IDLE = 'IDLE',
    LOADING = 'LOADING',
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR'
}

// Pagination and Table Enums
export enum SortOrder {
    ASC = 'ASC',
    DESC = 'DESC'
}

export enum TableSize {
    SMALL = 'SMALL',
    MEDIUM = 'MEDIUM',
    LARGE = 'LARGE'
}

// API and Error Enums
export enum ApiStatus {
    IDLE = 'IDLE',
    LOADING = 'LOADING',
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR'
}

export enum ErrorCode {
    UNAUTHORIZED = 'UNAUTHORIZED',
    FORBIDDEN = 'FORBIDDEN',
    NOT_FOUND = 'NOT_FOUND',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    INTERNAL_ERROR = 'INTERNAL_ERROR',
    NETWORK_ERROR = 'NETWORK_ERROR'
}

// Form and Validation Enums
export enum FormStatus {
    IDLE = 'IDLE',
    SUBMITTING = 'SUBMITTING',
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR'
}

export enum ValidationType {
    REQUIRED = 'REQUIRED',
    EMAIL = 'EMAIL',
    MIN_LENGTH = 'MIN_LENGTH',
    MAX_LENGTH = 'MAX_LENGTH',
    PATTERN = 'PATTERN',
    CUSTOM = 'CUSTOM'
} 