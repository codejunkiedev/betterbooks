import type { ActivityType } from '@/shared/types/activity';

export const ITEMS_PER_PAGE = 10;

export const activityTypeLabels: Record<ActivityType, string> = {
    USER_LOGIN: 'User Login',
    DOCUMENT_UPLOADED: 'Document Uploaded',
    DOCUMENT_DELETED: 'Document Deleted',
    JOURNAL_ENTRY_CREATED: 'Journal Entry Created',
    JOURNAL_ENTRY_UPDATED: 'Journal Entry Updated',
    COMPANY_ACTIVATED: 'Company Activated',
    COMPANY_DEACTIVATED: 'Company Deactivated',
    REPORT_GENERATED: 'Report Generated'
};

export const activityTypeColors: Record<ActivityType, string> = {
    USER_LOGIN: 'bg-blue-100 text-blue-800',
    DOCUMENT_UPLOADED: 'bg-green-100 text-green-800',
    DOCUMENT_DELETED: 'bg-red-100 text-red-800',
    JOURNAL_ENTRY_CREATED: 'bg-purple-100 text-purple-800',
    JOURNAL_ENTRY_UPDATED: 'bg-orange-100 text-orange-800',
    COMPANY_ACTIVATED: 'bg-emerald-100 text-emerald-800',
    COMPANY_DEACTIVATED: 'bg-red-100 text-red-800',
    REPORT_GENERATED: 'bg-indigo-100 text-indigo-800'
}; 