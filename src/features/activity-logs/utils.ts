import type { ActivityLog } from '@/shared/types/activity';
import { activityTypeLabels } from './constants';

export const formatActivityDescription = (activity: ActivityLog): string => {
    const baseDescription = activityTypeLabels[activity.activity];

    switch (activity.activity) {
        case 'DOCUMENT_UPLOADED':
        case 'DOCUMENT_DELETED':
            return `${baseDescription}: ${activity.details?.filename || 'Unknown file'}`;
        case 'JOURNAL_ENTRY_CREATED':
        case 'JOURNAL_ENTRY_UPDATED':
            return `${baseDescription}: ${activity.details?.description || 'No description'}`;
        case 'REPORT_GENERATED':
            return `${baseDescription}: ${activity.details?.report_type || 'Unknown report'}`;
        default:
            return baseDescription;
    }
};

export const calculateMostCommonActivity = (breakdown: Record<string, number> | undefined): string => {
    if (!breakdown) return 'None';
    if (Object.keys(breakdown).length === 0) return 'None';

    return Object.entries(breakdown).reduce((a, b) =>
        breakdown[a[0]] > breakdown[b[0]] ? a : b
    )[0];
}; 