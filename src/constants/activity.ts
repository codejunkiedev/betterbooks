import { ActivityType, NotificationType } from '@/types/enums';

// Activity Messages Configuration
export const ACTIVITY_MESSAGES = {
    [ActivityType.USER_LOGIN]: {
        title: 'User Login',
        description: 'User logged in successfully',
        icon: '👤',
        color: 'blue',
    },
    [ActivityType.USER_LOGOUT]: {
        title: 'User Logout',
        description: 'User logged out',
        icon: '🚪',
        color: 'gray',
    },
    [ActivityType.DOCUMENT_UPLOADED]: {
        title: 'Document Uploaded',
        description: 'New document uploaded',
        icon: '📄',
        color: 'green',
    },
    [ActivityType.DOCUMENT_PROCESSED]: {
        title: 'Document Processed',
        description: 'Document processed successfully',
        icon: '✅',
        color: 'green',
    },
    [ActivityType.JOURNAL_ENTRY_CREATED]: {
        title: 'Journal Entry Created',
        description: 'New journal entry created',
        icon: '📊',
        color: 'purple',
    },
    [ActivityType.COMPANY_CREATED]: {
        title: 'Company Created',
        description: 'New company created',
        icon: '🏢',
        color: 'blue',
    },
    [ActivityType.COMPANY_ACTIVATED]: {
        title: 'Company Activated',
        description: 'Company activated',
        icon: '✅',
        color: 'green',
    },
    [ActivityType.COMPANY_DEACTIVATED]: {
        title: 'Company Deactivated',
        description: 'Company deactivated',
        icon: '❌',
        color: 'red',
    },
    [ActivityType.PROFILE_UPDATED]: {
        title: 'Profile Updated',
        description: 'User profile updated',
        icon: '👤',
        color: 'blue',
    },
    [ActivityType.PASSWORD_CHANGED]: {
        title: 'Password Changed',
        description: 'Password changed successfully',
        icon: '🔒',
        color: 'orange',
    },
} as const;

// Notification Configuration
export const NOTIFICATION_CONFIG = {
    [NotificationType.SUCCESS]: {
        icon: '✅',
        color: 'green',
        duration: 5000,
    },
    [NotificationType.ERROR]: {
        icon: '❌',
        color: 'red',
        duration: 8000,
    },
    [NotificationType.WARNING]: {
        icon: '⚠️',
        color: 'orange',
        duration: 6000,
    },
    [NotificationType.INFO]: {
        icon: 'ℹ️',
        color: 'blue',
        duration: 4000,
    },
} as const;

// Activity Categories
export const ACTIVITY_CATEGORIES = {
    AUTHENTICATION: 'authentication',
    DOCUMENTS: 'documents',
    ACCOUNTING: 'accounting',
    COMPANY: 'company',
    PROFILE: 'profile',
    SYSTEM: 'system',
} as const;

// Activity Priority Levels
export const ACTIVITY_PRIORITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
} as const;

// Activity Status
export const ACTIVITY_STATUS = {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
} as const;

// Activity Filters
export const ACTIVITY_FILTERS = {
    ALL: 'all',
    TODAY: 'today',
    THIS_WEEK: 'this_week',
    THIS_MONTH: 'this_month',
    LAST_7_DAYS: 'last_7_days',
    LAST_30_DAYS: 'last_30_days',
    CUSTOM_RANGE: 'custom_range',
} as const;

// Activity Sort Options
export const ACTIVITY_SORT_OPTIONS = {
    DATE_DESC: 'date_desc',
    DATE_ASC: 'date_asc',
    TYPE_ASC: 'type_asc',
    TYPE_DESC: 'type_desc',
    USER_ASC: 'user_asc',
    USER_DESC: 'user_desc',
} as const;

// Activity Export Options
export const ACTIVITY_EXPORT_OPTIONS = {
    CSV: 'csv',
    EXCEL: 'excel',
    PDF: 'pdf',
    JSON: 'json',
} as const;

// Activity Retention Policy
export const ACTIVITY_RETENTION = {
    DEFAULT_DAYS: 90,
    MAX_DAYS: 365,
    ARCHIVE_AFTER_DAYS: 30,
    DELETE_AFTER_DAYS: 90,
} as const;

// Activity Batch Processing
export const ACTIVITY_BATCH_CONFIG = {
    BATCH_SIZE: 100,
    PROCESSING_DELAY: 1000, // 1 second
    MAX_RETRIES: 3,
    RETRY_DELAY: 5000, // 5 seconds
} as const; 