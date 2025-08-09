import { UserRole } from "./auth";

export type Status = 'active' | 'suspended' | 'pending_verification';

export interface AdminUser {
    id: string;
    email: string;
    phone?: string | undefined;
    created_at: string;
    last_sign_in_at?: string | undefined;
    role: UserRole;
    status: Status;
    company?: {
        id: string;
        name: string;
        type: string;
        is_active: boolean;
        created_at: string;
        assigned_accountant_id?: string | undefined;
        primary_contact_name?: string;
        phone_number?: string | undefined;
    } | null;
    assigned_accountant?: {
        id: string;
        full_name: string;
    } | null;
    active_modules: string[];
    documents_count: number;
    last_activity?: string | undefined;
}

export interface AdminUsersFilters {
    search?: string;
    status?: 'all' | Status;
    role?: 'all' | UserRole;
    assigned_accountant?: string;
    registration_date_from?: string;
    registration_date_to?: string;
    active_modules?: string[];
}

export interface CompanyData {
    user_id: string;
    name: string;
    type: string;
    is_active: boolean;
    created_at: string;
    assigned_accountant_id?: string;
}

export interface AdminUsersResponse {
    data: {
        items: AdminUser[];
        total: number;
        page: number;
        itemsPerPage: number;
        totalPages: number;
    } | null;
    error: Error | null;
}

export interface DetailedUserInfo {
    id: string;
    email: string;
    phone?: string | undefined;
    createdAt: string;
    lastSignInAt?: string;
    role: UserRole;
    status: Status;
    company?: {
        id: string;
        name: string;
        type: string;
        isActive: boolean;
        createdAt: string;
        primaryContactName?: string;
        phoneNumber?: string | undefined;
    } | null;
    assignedAccountant?: {
        id: string;
        fullName: string;
        email: string;
        assignedDate?: string;
    } | null;
    activeModules: string[];
    documentsCount: number;
    lastActivity?: string;
    usageStats?: {
        loginCount: number;
        documentsProcessed: number;
        reportsGenerated: number;
    };
    billing?: {
        plan: string;
        status: string;
        documentsUsed: number;
        documentsLimit: number | null;
        storageUsed: string;
        storageLimit: string | null;
    };
    supportHistory?: {
        totalTickets: number;
        openTickets: number;
        resolvedTickets: number;
        avgResolutionTime: string;
    };
}

export interface DetailedUserResponse {
    data: DetailedUserInfo | null;
    error: Error | null;
} 