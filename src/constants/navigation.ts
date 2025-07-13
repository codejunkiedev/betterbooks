import {
    Home,
    Upload,
    FileText,
    Sparkles,
    Users,
    UserCheck,
    Building,
    Settings,
    Shield,
    Activity,
    BarChart3,
    Receipt,
    Calculator
} from 'lucide-react';
import { UserRole, RouteType } from '@/types/enums';

// Route Configuration
export const ROUTES = {
    // Public Routes
    PUBLIC: {
        LOGIN: '/login',
        SIGNUP: '/signup',
        FORGOT_PASSWORD: '/forgot-password',
        RESET_PASSWORD: '/reset-password',
        NOT_FOUND: '/404',
    },

    // Protected Routes
    PROTECTED: {
        DASHBOARD: '/',
        PROFILE: '/profile',
        COMPANY_SETUP: '/company-setup',
    },

    // User Routes
    USER: {
        DASHBOARD: '/dashboard',
        UPLOAD: '/dashboard/upload',
        DOCUMENTS: '/dashboard/documents',
        AI_SUGGESTION: '/dashboard/ai-suggestion',
        PROFILE: '/dashboard/profile',
    },

    // Accountant Routes
    ACCOUNTANT: {
        DASHBOARD: '/accountant',
        CLIENTS: '/accountant/clients',
        DOCUMENTS: '/accountant/documents',
        JOURNAL_ENTRIES: '/accountant/journal-entries',
        REPORTS: '/accountant/reports',
        PROFILE: '/accountant/profile',
    },

    // Admin Routes
    ADMIN: {
        DASHBOARD: '/admin',
        USERS: '/admin/users',
        ACCOUNTANTS: '/admin/accountants',
        COMPANIES: '/admin/companies',
        SYSTEM_SETTINGS: '/admin/settings',
        SECURITY: '/admin/security',
        REPORTS: '/admin/reports',
        ACTIVITY_LOGS: '/admin/activity-logs',
    },
} as const;

// Navigation Items Configuration
export const NAVIGATION_ITEMS = {
    USER: [
        {
            to: ROUTES.USER.DASHBOARD,
            icon: Home,
            label: 'Home',
            description: 'Dashboard overview',
            roles: [UserRole.USER],
            type: RouteType.PROTECTED,
        },
        {
            to: ROUTES.USER.UPLOAD,
            icon: Upload,
            label: 'Upload Documents',
            description: 'Upload invoices and receipts',
            roles: [UserRole.USER],
            type: RouteType.PROTECTED,
        },
        {
            to: ROUTES.USER.DOCUMENTS,
            icon: FileText,
            label: 'Documents',
            description: 'View and manage documents',
            roles: [UserRole.USER],
            type: RouteType.PROTECTED,
        }
    ],

    ACCOUNTANT: [
        {
            to: ROUTES.ACCOUNTANT.DASHBOARD,
            icon: Home,
            label: 'Dashboard',
            description: 'Accountant dashboard',
            roles: [UserRole.ACCOUNTANT],
            type: RouteType.ACCOUNTANT_ONLY,
        },
        {
            to: ROUTES.ACCOUNTANT.CLIENTS,
            icon: Users,
            label: 'Clients',
            description: 'Manage client companies',
            roles: [UserRole.ACCOUNTANT],
            type: RouteType.ACCOUNTANT_ONLY,
        },
        {
            to: ROUTES.ACCOUNTANT.DOCUMENTS,
            icon: FileText,
            label: 'Documents',
            description: 'Review client documents',
            roles: [UserRole.ACCOUNTANT],
            type: RouteType.ACCOUNTANT_ONLY,
        },
        {
            to: ROUTES.ACCOUNTANT.JOURNAL_ENTRIES,
            icon: Calculator,
            label: 'Journal Entries',
            description: 'Create and manage entries',
            roles: [UserRole.ACCOUNTANT],
            type: RouteType.ACCOUNTANT_ONLY,
        },
        {
            to: ROUTES.ACCOUNTANT.REPORTS,
            icon: BarChart3,
            label: 'Reports',
            description: 'Financial reports',
            roles: [UserRole.ACCOUNTANT],
            type: RouteType.ACCOUNTANT_ONLY,
        },
    ],

    ADMIN: [
        {
            to: ROUTES.ADMIN.DASHBOARD,
            icon: Home,
            label: 'Dashboard',
            description: 'Admin dashboard',
            roles: [UserRole.ADMIN],
            type: RouteType.ADMIN_ONLY,
        },
        {
            to: ROUTES.ADMIN.USERS,
            icon: Users,
            label: 'Users',
            description: 'Manage system users',
            roles: [UserRole.ADMIN],
            type: RouteType.ADMIN_ONLY,
        },
        {
            to: ROUTES.ADMIN.ACCOUNTANTS,
            icon: UserCheck,
            label: 'Accountants',
            description: 'Manage accountants',
            roles: [UserRole.ADMIN],
            type: RouteType.ADMIN_ONLY,
        },
        {
            to: ROUTES.ADMIN.COMPANIES,
            icon: Building,
            label: 'Companies',
            description: 'View all companies',
            roles: [UserRole.ADMIN],
            type: RouteType.ADMIN_ONLY,
        },
        {
            to: ROUTES.ADMIN.ACTIVITY_LOGS,
            icon: Activity,
            label: 'Activity Logs',
            description: 'System activity monitoring',
            roles: [UserRole.ADMIN],
            type: RouteType.ADMIN_ONLY,
        },
        {
            to: ROUTES.ADMIN.REPORTS,
            icon: BarChart3,
            label: 'Reports',
            description: 'System reports',
            roles: [UserRole.ADMIN],
            type: RouteType.ADMIN_ONLY,
        },
        {
            to: ROUTES.ADMIN.SYSTEM_SETTINGS,
            icon: Settings,
            label: 'Settings',
            description: 'System configuration',
            roles: [UserRole.ADMIN],
            type: RouteType.ADMIN_ONLY,
        },
        {
            to: ROUTES.ADMIN.SECURITY,
            icon: Shield,
            label: 'Security',
            description: 'Security settings',
            roles: [UserRole.ADMIN],
            type: RouteType.ADMIN_ONLY,
        },
    ],
} as const;

// Quick Actions Configuration
export const QUICK_ACTIONS = {
    USER: [
        {
            label: 'Upload Invoice',
            description: 'Upload a new invoice',
            icon: Receipt,
            action: 'upload-invoice',
            route: ROUTES.USER.UPLOAD,
        },
        {
            label: 'View Documents',
            description: 'Browse your documents',
            icon: FileText,
            action: 'view-documents',
            route: ROUTES.USER.DOCUMENTS,
        },
        {
            label: 'AI Insights',
            description: 'Get AI-powered insights',
            icon: Sparkles,
            action: 'ai-insights',
            route: ROUTES.USER.AI_SUGGESTION,
        },
    ],

    ACCOUNTANT: [
        {
            label: 'Review Documents',
            description: 'Review pending documents',
            icon: FileText,
            action: 'review-documents',
            route: ROUTES.ACCOUNTANT.DOCUMENTS,
        },
        {
            label: 'Create Entry',
            description: 'Create journal entry',
            icon: Calculator,
            action: 'create-entry',
            route: ROUTES.ACCOUNTANT.JOURNAL_ENTRIES,
        },
        {
            label: 'Client Reports',
            description: 'Generate client reports',
            icon: BarChart3,
            action: 'client-reports',
            route: ROUTES.ACCOUNTANT.REPORTS,
        },
    ],

    ADMIN: [
        {
            label: 'Manage Users',
            description: 'Add or modify users',
            icon: Users,
            action: 'manage-users',
            route: ROUTES.ADMIN.USERS,
        },
        {
            label: 'System Settings',
            description: 'Configure system settings',
            icon: Settings,
            action: 'system-settings',
            route: ROUTES.ADMIN.SYSTEM_SETTINGS,
        },
        {
            label: 'Security Center',
            description: 'Security and compliance',
            icon: Shield,
            action: 'security-center',
            route: ROUTES.ADMIN.SECURITY,
        },
    ],
} as const;

// Breadcrumb Configuration
export const BREADCRUMB_CONFIG = {
    SEPARATOR: '/',
    HOME_LABEL: 'Home',
    MAX_ITEMS: 5,
} as const;

// Tab Configuration
export const TAB_CONFIG = {
    DEFAULT_ACTIVE_TAB: 0,
    ANIMATION_DURATION: 200,
} as const;

// Menu Configuration
export const MENU_CONFIG = {
    ANIMATION_DURATION: 200,
    SUBMENU_DELAY: 100,
    CLOSE_ON_CLICK_OUTSIDE: true,
} as const; 