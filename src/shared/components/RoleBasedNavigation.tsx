import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/useAuth';
import { UserRole, Permission } from '@/shared/types';
import {
    Home,
    FileText,
    BarChart3,
    Users,
    Settings,
    MessageSquare,
    Upload,
    BookOpen,
    Activity,
    Shield,
    Building,
    FileSpreadsheet
} from 'lucide-react';

interface NavigationItem {
    label: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
    requiredRole?: UserRole;
    requiredPermissions?: Permission[];
    badge?: string | number;
}

export const RoleBasedNavigation: React.FC = () => {
    const { userPermissions, isRole, hasPermission } = useAuth();
    const location = useLocation();

    if (!userPermissions) return null;

    const navigationItems: NavigationItem[] = [
        // Common items for all roles
        {
            label: 'Dashboard',
            path: getDashboardPath(userPermissions.role),
            icon: Home
        },

        // User-specific items
        ...(isRole(UserRole.USER) ? [
            {
                label: 'Documents',
                path: '/documents',
                icon: FileText,
                requiredPermissions: [Permission.VIEW_OWN_DOCUMENTS]
            },
            {
                label: 'Upload Documents',
                path: '/upload',
                icon: Upload,
                requiredPermissions: [Permission.UPLOAD_DOCUMENTS]
            },
            {
                label: 'Journal Entries',
                path: '/journal',
                icon: BookOpen,
                requiredPermissions: [Permission.VIEW_OWN_JOURNAL_ENTRIES]
            },
            {
                label: 'Reports',
                path: '/reports',
                icon: BarChart3,
                requiredPermissions: [Permission.VIEW_OWN_REPORTS]
            },
            {
                label: 'Tax Documents',
                path: '/tax-documents',
                icon: FileSpreadsheet,
                requiredPermissions: [Permission.VIEW_TAX_DOCUMENTS]
            },
            {
                label: 'Messages',
                path: '/messages',
                icon: MessageSquare,
                requiredPermissions: [Permission.VIEW_OWN_MESSAGES],
                badge: '3' // You can make this dynamic
            }
        ] : []),

        // Accountant-specific items
        ...(isRole(UserRole.ACCOUNTANT) ? [
            {
                label: 'Clients',
                path: '/accountant/clients',
                icon: Users,
                requiredPermissions: [Permission.VIEW_ALL_DOCUMENTS]
            },
            {
                label: 'Documents',
                path: '/accountant/documents',
                icon: FileText,
                requiredPermissions: [Permission.VIEW_ALL_DOCUMENTS]
            },
            {
                label: 'Journal Entries',
                path: '/accountant/journal',
                icon: BookOpen,
                requiredPermissions: [Permission.VIEW_ALL_JOURNAL_ENTRIES]
            },
            {
                label: 'Reports',
                path: '/accountant/reports',
                icon: BarChart3,
                requiredPermissions: [Permission.VIEW_ALL_REPORTS]
            },
            {
                label: 'Tax Documents',
                path: '/accountant/tax-documents',
                icon: FileSpreadsheet,
                requiredPermissions: [Permission.MANAGE_TAX_DOCUMENTS]
            },
            {
                label: 'Messages',
                path: '/accountant/messages',
                icon: MessageSquare,
                requiredPermissions: [Permission.VIEW_ALL_MESSAGES]
            },
            {
                label: 'Activity Logs',
                path: '/accountant/activity-logs',
                icon: Activity,
                requiredPermissions: [Permission.VIEW_ACTIVITY_LOGS]
            }
        ] : []),

        // Admin-specific items
        ...(isRole(UserRole.ADMIN) ? [
            {
                label: 'Dashboard',
                path: '/admin/dashboard',
                icon: Home
            },
            {
                label: 'Users',
                path: '/admin/users',
                icon: Users,
                requiredPermissions: [Permission.MANAGE_ALL_USERS]
            },
            {
                label: 'Accountants',
                path: '/admin/accountants',
                icon: Shield,
                requiredPermissions: [Permission.MANAGE_ACCOUNTANTS]
            },
            {
                label: 'Companies',
                path: '/admin/companies',
                icon: Building,
                requiredPermissions: [Permission.MANAGE_ALL_COMPANIES]
            },
            {
                label: 'Reports',
                path: '/admin/reports',
                icon: BarChart3,
                requiredPermissions: [Permission.VIEW_SYSTEM_REPORTS]
            },
            {
                label: 'Activity Logs',
                path: '/admin/activity-logs',
                icon: Activity,
                requiredPermissions: [Permission.VIEW_ACTIVITY_LOGS]
            },
            {
                label: 'System Config',
                path: '/admin/system-config',
                icon: Settings,
                requiredPermissions: [Permission.MANAGE_SYSTEM_CONFIG]
            }
        ] : [])
    ];

    // Filter items based on permissions
    const filteredItems = navigationItems.filter(item => {
        if (item.requiredRole && !isRole(item.requiredRole)) {
            return false;
        }

        if (item.requiredPermissions && !item.requiredPermissions.every(permission =>
            hasPermission(permission)
        )) {
            return false;
        }

        return true;
    });

    return (
        <nav className="space-y-2">
            {filteredItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                            ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                    >
                        <Icon className="mr-3 h-5 w-5" />
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                            <span className="ml-auto bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full">
                                {item.badge}
                            </span>
                        )}
                    </Link>
                );
            })}
        </nav>
    );
};

// Helper function to get dashboard path based on role
const getDashboardPath = (role: UserRole): string => {
    switch (role) {
        case UserRole.ADMIN:
            return '/admin/dashboard';
        case UserRole.ACCOUNTANT:
            return '/accountant/dashboard';
        case UserRole.USER:
        default:
            return '/dashboard';
    }
};

// Role-specific navigation components
export const UserNavigation: React.FC = () => {
    const { isRole } = useAuth();
    return isRole(UserRole.USER) ? <RoleBasedNavigation /> : null;
};

export const AccountantNavigation: React.FC = () => {
    const { isRole } = useAuth();
    return isRole(UserRole.ACCOUNTANT) ? <RoleBasedNavigation /> : null;
};

export const AdminNavigation: React.FC = () => {
    const { isRole } = useAuth();
    return isRole(UserRole.ADMIN) ? <RoleBasedNavigation /> : null;
}; 