import { ActivityType } from '@/shared/types/activity';

// Activity type labels for display
export const activityTypeLabels: Record<ActivityType, string> = {
    USER_LOGIN: "User Login",
    USER_LOGOUT: "User Logout",
    DOCUMENT_UPLOADED: "Document Uploaded",
    DOCUMENT_DELETED: "Document Deleted",
    JOURNAL_ENTRY_CREATED: "Journal Entry Created",
    JOURNAL_ENTRY_UPDATED: "Journal Entry Updated",
    COMPANY_ACTIVATED: "Company Activated",
    COMPANY_DEACTIVATED: "Company Deactivated",
    REPORT_GENERATED: "Report Generated",
};

// Activity type colors for badges
export const activityTypeColors: Record<ActivityType, string> = {
    USER_LOGIN: "bg-blue-100 text-blue-800",
    USER_LOGOUT: "bg-gray-100 text-gray-800",
    DOCUMENT_UPLOADED: "bg-green-100 text-green-800",
    DOCUMENT_DELETED: "bg-red-100 text-red-800",
    JOURNAL_ENTRY_CREATED: "bg-purple-100 text-purple-800",
    JOURNAL_ENTRY_UPDATED: "bg-orange-100 text-orange-800",
    COMPANY_ACTIVATED: "bg-emerald-100 text-emerald-800",
    COMPANY_DEACTIVATED: "bg-red-100 text-red-800",
    REPORT_GENERATED: "bg-indigo-100 text-indigo-800",
};

// Default filters
export const defaultActivityLogFilters = {
    activity_type: "all" as ActivityType | "all",
    company_id: "all",
    date_from: "",
    date_to: "",
};

// Activity type options for select dropdowns
export const activityTypeOptions = [
    { value: "all", label: "All Activities" },
    { value: "USER_LOGIN", label: "User Login" },
    { value: "USER_LOGOUT", label: "User Logout" },
    { value: "DOCUMENT_UPLOADED", label: "Document Uploaded" },
    { value: "DOCUMENT_DELETED", label: "Document Deleted" },
    { value: "JOURNAL_ENTRY_CREATED", label: "Journal Entry Created" },
    { value: "JOURNAL_ENTRY_UPDATED", label: "Journal Entry Updated" },
    { value: "COMPANY_ACTIVATED", label: "Company Activated" },
    { value: "COMPANY_DEACTIVATED", label: "Company Deactivated" },
    { value: "REPORT_GENERATED", label: "Report Generated" },
];

// Page size options
export const pageSizeOptions = [10, 20, 50, 100];

// Default page size
export const DEFAULT_PAGE_SIZE = 20; 