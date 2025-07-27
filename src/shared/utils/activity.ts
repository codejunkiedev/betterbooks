import { ActivityLog, ActivityType } from '@/shared/types/activity';
import { activityTypeLabels, defaultActivityLogFilters } from '@/shared/constants/activity';
import { createActivityLog } from '@/shared/services/supabase/activity';

// Simple helper to log activity
export const logActivity = async (companyId: string | null, userId: string | null, activityType: ActivityType, email: string, action: string, extra = {}) => {
    return createActivityLog(companyId, userId, activityType, {
        email,
        timestamp: new Date().toISOString(),
        company_id: companyId,
        login_method: action,
        ...extra
    });
};

// Helper function to get activity description with details
export const getActivityDescription = (activity: ActivityLog): string => {
    const baseDescription = activityTypeLabels[activity.activity];

    if (activity.details) {
        switch (activity.activity) {
            case ActivityType.USER_LOGIN: {
                const isNewUser = activity.details.is_new_user ? ' (New User)' : '';
                return `${baseDescription}: ${activity.details.email || 'Unknown email'}${isNewUser}`;
            }
            case ActivityType.USER_LOGOUT: {
                return `${baseDescription}: ${activity.details.email || 'Unknown email'}`;
            }
            case ActivityType.DOCUMENT_UPLOADED:
                return `${baseDescription}: ${activity.details.filename || 'Unknown file'}`;
            case ActivityType.DOCUMENT_DELETED:
                return `${baseDescription}: ${activity.details.filename || 'Unknown file'}`;
            case ActivityType.JOURNAL_ENTRY_CREATED:
            case ActivityType.JOURNAL_ENTRY_UPDATED:
                return `${baseDescription}: Entry #${activity.details.entry_id || 'Unknown'}`;
            case ActivityType.COMPANY_ACTIVATED:
            case ActivityType.COMPANY_DEACTIVATED:
                return `${baseDescription}: ${activity.details.company_name || 'Unknown company'}`;
            case ActivityType.REPORT_GENERATED:
                return `${baseDescription}: ${activity.details.report_type || 'Unknown report'}`;
            default:
                return baseDescription;
        }
    }

    return baseDescription;
};

// Helper function to count active filters
export const getActiveFiltersCount = (filters: typeof defaultActivityLogFilters): number => {
    return Object.values(filters).filter(value => value !== undefined && value !== '' && value !== 'all').length;
};

// Helper function to format activity timestamp
export const formatActivityTimestamp = (timestamp: string | null): string => {
    if (!timestamp) return 'Unknown time';
    return new Date(timestamp).toLocaleString();
};

// Helper function to get activity icon based on type
export const getActivityIcon = (activityType: string): string => {
    switch (activityType) {
        case ActivityType.USER_LOGIN:
            return '👤';
        case ActivityType.USER_LOGOUT:
            return '🚪';
        case ActivityType.DOCUMENT_UPLOADED:
            return '📄';
        case ActivityType.DOCUMENT_DELETED:
            return '🗑️';
        case ActivityType.JOURNAL_ENTRY_CREATED:
        case ActivityType.JOURNAL_ENTRY_UPDATED:
            return '📝';
        case ActivityType.COMPANY_ACTIVATED:
        case ActivityType.COMPANY_DEACTIVATED:
            return '🏢';
        case ActivityType.REPORT_GENERATED:
            return '📊';
        default:
            return '📋';
    }
};

// Helper function to validate activity filters
export const validateActivityFilters = (filters: typeof defaultActivityLogFilters): boolean => {
    // Check if date_from is before date_to
    if (filters.date_from && filters.date_to) {
        const fromDate = new Date(filters.date_from);
        const toDate = new Date(filters.date_to);
        if (fromDate > toDate) {
            return false;
        }
    }

    return true;
}; 