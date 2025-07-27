
export const ActivityType = {
    USER_LOGIN: 'USER_LOGIN',
    USER_LOGOUT: 'USER_LOGOUT',
    DOCUMENT_UPLOADED: 'DOCUMENT_UPLOADED',
    DOCUMENT_DELETED: 'DOCUMENT_DELETED',
    JOURNAL_ENTRY_CREATED: 'JOURNAL_ENTRY_CREATED',
    JOURNAL_ENTRY_UPDATED: 'JOURNAL_ENTRY_UPDATED',
    COMPANY_ACTIVATED: 'COMPANY_ACTIVATED',
    COMPANY_DEACTIVATED: 'COMPANY_DEACTIVATED',
    REPORT_GENERATED: 'REPORT_GENERATED',
} as const;

export type ActivityType = (typeof ActivityType)[keyof typeof ActivityType];

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