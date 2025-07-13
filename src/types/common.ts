import {
    UserRole,
    CompanyType,
    CompanyStatus,
    DocumentStatus,
    DocumentType,
    ActivityType,
    NotificationType,
    ApiStatus,
    ErrorCode,
    FormStatus
} from './enums';

// Base Entity Types
export interface BaseEntity {
    id: string;
    created_at: string;
    updated_at: string;
}

export interface BaseEntityWithUser extends BaseEntity {
    user_id: string;
}

// User and Authentication Types
export interface User extends BaseEntity {
    email: string;
    full_name: string;
    role: UserRole;
    avatar_url?: string;
    is_active: boolean;
    last_login?: string;
    email_verified: boolean;
}

export interface AuthUser {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    avatarUrl?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface SignUpData {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
}

export interface PasswordResetData {
    email: string;
}

export interface ProfileUpdateData {
    fullName: string;
    avatarUrl?: string;
}

// Company Types
export interface Company extends BaseEntityWithUser {
    name: string;
    type: CompanyType;
    status: CompanyStatus;
    is_active: boolean;
    address?: string;
    phone?: string;
    website?: string;
    tax_id?: string;
    opening_balance?: number;
    opening_balance_date?: string;
    accountant_id?: string;
}

export interface CompanySetupData {
    name: string;
    type: CompanyType;
    openingBalance?: number;
    openingBalanceDate?: string;
}

// Document Types
export interface Document extends BaseEntityWithUser {
    name: string;
    type: DocumentType;
    status: DocumentStatus;
    file_path: string;
    file_size: number;
    mime_type: string;
    company_id: string;
    processed_data?: DocumentProcessedData;
    confidence_score?: number;
    uploaded_by: string;
}

export interface DocumentProcessedData {
    amount?: number;
    date?: string;
    vendor?: string;
    description?: string;
    category?: string;
    line_items?: DocumentLineItem[];
}

export interface DocumentLineItem {
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
    category?: string;
}

// Accounting Types
export interface JournalEntry extends BaseEntityWithUser {
    company_id: string;
    entry_date: string;
    reference_number: string;
    description: string;
    status: string;
    total_debit: number;
    total_credit: number;
    lines: JournalEntryLine[];
}

export interface JournalEntryLine {
    id: string;
    account_id: string;
    account_name: string;
    debit_amount: number;
    credit_amount: number;
    description: string;
}

export interface Account extends BaseEntityWithUser {
    company_id: string;
    code: string;
    name: string;
    type: string;
    parent_account_id?: string;
    is_active: boolean;
    balance: number;
}

// Activity and Notification Types
export interface ActivityLog extends BaseEntity {
    actor_id: string;
    activity: ActivityType;
    details: Record<string, unknown>;
    company_id?: string;
    document_id?: string;
    ip_address?: string;
    user_agent?: string;
}

export interface Notification extends BaseEntity {
    user_id: string;
    type: NotificationType;
    title: string;
    message: string;
    is_read: boolean;
    action_url?: string;
    metadata?: Record<string, unknown>;
}

// API Response Types
export interface ApiResponse<T = unknown> {
    data: T;
    message?: string;
    status: ApiStatus;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}

export interface ApiError {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
}

// Form Types
export interface FormState<T = unknown> {
    data: T;
    status: FormStatus;
    errors: Record<string, string>;
    touched: Record<string, boolean>;
}

export interface ValidationRule {
    type: string;
    value?: unknown;
    message: string;
}

// UI Types
export interface LoadingStateData {
    isLoading: boolean;
    error?: string;
}

export interface TableColumn<T = unknown> {
    key: string;
    label: string;
    sortable?: boolean;
    width?: string;
    render?: (value: unknown, row: T) => React.ReactNode;
}

export interface TableFilters {
    search?: string;
    status?: string;
    date_range?: {
        start: string;
        end: string;
    };
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export interface PaginationState {
    current_page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
}

// Dashboard Types
export interface DashboardStats {
    total_users: number;
    total_accountants: number;
    total_companies: number;
    total_documents: number;
    pending_documents: number;
    active_companies: number;
    inactive_companies: number;
    total_revenue: number;
    monthly_growth: number;
}

export interface RecentActivity {
    id: string;
    activity: ActivityType;
    actor_name: string;
    company_name?: string;
    created_at: string;
    details: Record<string, unknown>;
}

// File Upload Types
export interface FileUploadProgress {
    file_id: string;
    filename: string;
    progress: number;
    status: 'uploading' | 'completed' | 'error';
    error?: string;
}

export interface FileValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

// Search and Filter Types
export interface SearchFilters {
    query?: string;
    filters?: Record<string, unknown>;
    sort?: {
        field: string;
        order: 'asc' | 'desc';
    };
    pagination?: {
        page: number;
        page_size: number;
    };
}

export interface FilterOption {
    value: string;
    label: string;
    count?: number;
}

// Export Types
export interface ExportOptions {
    format: 'csv' | 'excel' | 'pdf' | 'json';
    include_headers: boolean;
    date_format?: string;
    filters?: Record<string, unknown>;
}

// Settings Types
export interface UserSettings {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
    date_format: string;
    currency: string;
    notifications: {
        email: boolean;
        push: boolean;
        sms: boolean;
    };
}

export interface SystemSettings {
    maintenance_mode: boolean;
    registration_enabled: boolean;
    max_file_size: number;
    allowed_file_types: string[];
    session_timeout: number;
    password_policy: {
        min_length: number;
        require_uppercase: boolean;
        require_lowercase: boolean;
        require_numbers: boolean;
        require_special_chars: boolean;
    };
} 