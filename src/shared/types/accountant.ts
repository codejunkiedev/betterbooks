export interface Accountant {
    id: string;
    user_id: string;
    full_name: string;
    is_active: boolean;
    phone_number?: string | null;
    professional_qualifications?: string | null;
    specialization?: string[] | null;
    employment_type?: string | null;
    max_client_capacity?: number | null;
    start_date?: string | null;
    accountant_code?: string | null;
}

export interface AccountantFilters {
    search?: string;
    status?: 'all' | 'active' | 'inactive';
    specialization?: string | 'all';
    employment_type?: 'Full-time' | 'Part-time' | 'Consultant' | 'all';
}

export interface AccountantsPage {
    items: Accountant[];
    total: number;
    page: number;
    itemsPerPage: number;
    totalPages: number;
} 