export type ActivityType =
    | 'USER_LOGIN'
    | 'DOCUMENT_UPLOADED'
    | 'DOCUMENT_DELETED'
    | 'JOURNAL_ENTRY_CREATED'
    | 'JOURNAL_ENTRY_UPDATED'
    | 'COMPANY_ACTIVATED'
    | 'COMPANY_DEACTIVATED'
    | 'REPORT_GENERATED';

export interface ActivityLog {
    id: number;
    company_id: string | null;
    actor_id: string | null;
    activity: ActivityType;
    details: Record<string, unknown> | null;
    created_at: string | null;
    // Joined fields
    actor_name?: string;
    actor_email?: string;
    company_name?: string;
}

export interface ActivityLogFilters {
    company_id?: string | null;
    activity_type?: ActivityType;
    actor_id?: string | null;
    date_from?: string;
    date_to?: string;
    search?: string;
}

export interface ActivityLogResponse {
    items: ActivityLog[];
    total: number;
    page: number;
    total_pages: number;
} 