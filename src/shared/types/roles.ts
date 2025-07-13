// Role-based access control types
export enum UserRole {
    USER = 'USER',           // Business owner/client
    ACCOUNTANT = 'ACCOUNTANT', // Professional accountant
    ADMIN = 'ADMIN'          // System administrator
}

export enum Permission {
    // Document Management
    UPLOAD_DOCUMENTS = 'UPLOAD_DOCUMENTS',
    VIEW_OWN_DOCUMENTS = 'VIEW_OWN_DOCUMENTS',
    VIEW_ALL_DOCUMENTS = 'VIEW_ALL_DOCUMENTS',
    DELETE_DOCUMENTS = 'DELETE_DOCUMENTS',

    // Journal Entries
    CREATE_JOURNAL_ENTRIES = 'CREATE_JOURNAL_ENTRIES',
    VIEW_OWN_JOURNAL_ENTRIES = 'VIEW_OWN_JOURNAL_ENTRIES',
    VIEW_ALL_JOURNAL_ENTRIES = 'VIEW_ALL_JOURNAL_ENTRIES',
    EDIT_JOURNAL_ENTRIES = 'EDIT_JOURNAL_ENTRIES',
    DELETE_JOURNAL_ENTRIES = 'DELETE_JOURNAL_ENTRIES',

    // Reports
    VIEW_OWN_REPORTS = 'VIEW_OWN_REPORTS',
    VIEW_ALL_REPORTS = 'VIEW_ALL_REPORTS',
    EXPORT_REPORTS = 'EXPORT_REPORTS',

    // Company Management
    MANAGE_OWN_COMPANY = 'MANAGE_OWN_COMPANY',
    MANAGE_ALL_COMPANIES = 'MANAGE_ALL_COMPANIES',
    ACTIVATE_DEACTIVATE_COMPANIES = 'ACTIVATE_DEACTIVATE_COMPANIES',

    // User Management
    MANAGE_OWN_PROFILE = 'MANAGE_OWN_PROFILE',
    MANAGE_ALL_USERS = 'MANAGE_ALL_USERS',
    MANAGE_ACCOUNTANTS = 'MANAGE_ACCOUNTANTS',

    // Communication
    SEND_MESSAGES = 'SEND_MESSAGES',
    VIEW_OWN_MESSAGES = 'VIEW_OWN_MESSAGES',
    VIEW_ALL_MESSAGES = 'VIEW_ALL_MESSAGES',

    // System Administration
    VIEW_ACTIVITY_LOGS = 'VIEW_ACTIVITY_LOGS',
    MANAGE_SYSTEM_CONFIG = 'MANAGE_SYSTEM_CONFIG',
    VIEW_SYSTEM_REPORTS = 'VIEW_SYSTEM_REPORTS',

    // Chart of Accounts
    VIEW_OWN_COA = 'VIEW_OWN_COA',
    VIEW_ALL_COA = 'VIEW_ALL_COA',
    MANAGE_COA_TEMPLATES = 'MANAGE_COA_TEMPLATES',

    // Tax Documents
    UPLOAD_TAX_DOCUMENTS = 'UPLOAD_TAX_DOCUMENTS',
    VIEW_TAX_DOCUMENTS = 'VIEW_TAX_DOCUMENTS',
    MANAGE_TAX_DOCUMENTS = 'MANAGE_TAX_DOCUMENTS'
}

export interface RolePermissions {
    role: UserRole;
    permissions: Permission[];
}

export interface UserPermissions {
    userId: string;
    role: UserRole;
    permissions: Permission[];
    companyId?: string; // For users associated with a company
    assignedAccountantId?: string; // For users assigned to an accountant
}

// Role-based permission mappings
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    [UserRole.USER]: [
        Permission.UPLOAD_DOCUMENTS,
        Permission.VIEW_OWN_DOCUMENTS,
        Permission.VIEW_OWN_JOURNAL_ENTRIES,
        Permission.VIEW_OWN_REPORTS,
        Permission.EXPORT_REPORTS,
        Permission.MANAGE_OWN_COMPANY,
        Permission.MANAGE_OWN_PROFILE,
        Permission.SEND_MESSAGES,
        Permission.VIEW_OWN_MESSAGES,
        Permission.VIEW_OWN_COA,
        Permission.VIEW_TAX_DOCUMENTS
    ],

    [UserRole.ACCOUNTANT]: [
        Permission.VIEW_ALL_DOCUMENTS,
        Permission.CREATE_JOURNAL_ENTRIES,
        Permission.VIEW_ALL_JOURNAL_ENTRIES,
        Permission.EDIT_JOURNAL_ENTRIES,
        Permission.VIEW_ALL_REPORTS,
        Permission.EXPORT_REPORTS,
        Permission.ACTIVATE_DEACTIVATE_COMPANIES,
        Permission.SEND_MESSAGES,
        Permission.VIEW_ALL_MESSAGES,
        Permission.VIEW_ALL_COA,
        Permission.UPLOAD_TAX_DOCUMENTS,
        Permission.MANAGE_TAX_DOCUMENTS,
        Permission.VIEW_ACTIVITY_LOGS
    ],

    [UserRole.ADMIN]: [
        Permission.VIEW_ALL_DOCUMENTS,
        Permission.DELETE_DOCUMENTS,
        Permission.VIEW_ALL_JOURNAL_ENTRIES,
        Permission.EDIT_JOURNAL_ENTRIES,
        Permission.DELETE_JOURNAL_ENTRIES,
        Permission.VIEW_ALL_REPORTS,
        Permission.EXPORT_REPORTS,
        Permission.MANAGE_ALL_COMPANIES,
        Permission.ACTIVATE_DEACTIVATE_COMPANIES,
        Permission.MANAGE_ALL_USERS,
        Permission.MANAGE_ACCOUNTANTS,
        Permission.VIEW_ALL_MESSAGES,
        Permission.VIEW_ACTIVITY_LOGS,
        Permission.MANAGE_SYSTEM_CONFIG,
        Permission.VIEW_SYSTEM_REPORTS,
        Permission.MANAGE_COA_TEMPLATES,
        Permission.MANAGE_TAX_DOCUMENTS
    ]
};

// Helper functions for permission checking
export const hasPermission = (
    userPermissions: UserPermissions,
    requiredPermission: Permission
): boolean => {
    return userPermissions.permissions.includes(requiredPermission);
};

export const hasAnyPermission = (
    userPermissions: UserPermissions,
    requiredPermissions: Permission[]
): boolean => {
    return requiredPermissions.some(permission =>
        userPermissions.permissions.includes(permission)
    );
};

export const hasAllPermissions = (
    userPermissions: UserPermissions,
    requiredPermissions: Permission[]
): boolean => {
    return requiredPermissions.every(permission =>
        userPermissions.permissions.includes(permission)
    );
};

export const isRole = (
    userPermissions: UserPermissions,
    role: UserRole
): boolean => {
    return userPermissions.role === role;
};

export const isAtLeastRole = (
    userPermissions: UserPermissions,
    minimumRole: UserRole
): boolean => {
    const roleHierarchy = {
        [UserRole.USER]: 1,
        [UserRole.ACCOUNTANT]: 2,
        [UserRole.ADMIN]: 3
    };

    return roleHierarchy[userPermissions.role] >= roleHierarchy[minimumRole];
}; 