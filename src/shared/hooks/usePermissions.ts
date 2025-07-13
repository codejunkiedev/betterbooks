import { useAuth } from './useAuth';
import { UserRole, Permission } from '@/shared/types';

export const usePermissions = () => {
    const { userPermissions, hasPermission, hasAnyPermission, hasAllPermissions, isRole, isAtLeastRole } = useAuth();

    return {
        // User permissions state
        userPermissions,

        // Permission checking
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,

        // Role checking
        isRole,
        isAtLeastRole,

        // Convenience methods
        isUser: () => isRole(UserRole.USER),
        isAccountant: () => isRole(UserRole.ACCOUNTANT),
        isAdmin: () => isRole(UserRole.ADMIN),

        // Permission groups
        canUploadDocuments: () => hasPermission(Permission.UPLOAD_DOCUMENTS),
        canViewAllDocuments: () => hasPermission(Permission.VIEW_ALL_DOCUMENTS),
        canCreateJournalEntries: () => hasPermission(Permission.CREATE_JOURNAL_ENTRIES),
        canManageUsers: () => hasPermission(Permission.MANAGE_ALL_USERS),
        canViewActivityLogs: () => hasPermission(Permission.VIEW_ACTIVITY_LOGS),
        canManageSystem: () => hasPermission(Permission.MANAGE_SYSTEM_CONFIG),

        // Role-based navigation helpers
        getDashboardPath: () => {
            if (!userPermissions) return '/login';

            switch (userPermissions.role) {
                case UserRole.ADMIN:
                    return '/admin/dashboard';
                case UserRole.ACCOUNTANT:
                    return '/accountant/dashboard';
                case UserRole.USER:
                default:
                    return '/dashboard';
            }
        },

        // Test helper
        getRoleDisplayName: () => {
            if (!userPermissions) return 'Unknown';

            switch (userPermissions.role) {
                case UserRole.ADMIN:
                    return 'Administrator';
                case UserRole.ACCOUNTANT:
                    return 'Accountant';
                case UserRole.USER:
                    return 'User';
                default:
                    return 'Unknown';
            }
        }
    };
}; 