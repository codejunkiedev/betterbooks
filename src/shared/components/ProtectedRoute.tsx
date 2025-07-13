import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/useAuth';
import { UserRole, Permission } from '@/shared/types';
import { LoadingSpinner } from '@/shared/components/Loading';

interface ProtectedRouteProps {
    children: ReactNode;
    requiredRole?: UserRole;
    requiredPermissions?: Permission[];
    fallbackPath?: string;
    showLoading?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requiredRole,
    requiredPermissions = [],
    fallbackPath = '/login',
    showLoading = true
}) => {
    const { user, userPermissions, loading, isRole, hasAllPermissions } = useAuth();
    const location = useLocation();

    // Show loading while auth state is being determined
    if (loading && showLoading) {
        return <LoadingSpinner size="lg" text="Loading..." />;
    }

    // Redirect to login if not authenticated
    if (!user) {
        return <Navigate to={fallbackPath} state={{ from: location }} replace />;
    }

    // Check role requirement
    if (requiredRole && !isRole(requiredRole)) {
        // Redirect to appropriate dashboard based on user's actual role
        const redirectPath = getDashboardPath(userPermissions?.role);
        return <Navigate to={redirectPath} replace />;
    }

    // Check permission requirements
    if (requiredPermissions.length > 0 && !hasAllPermissions(requiredPermissions)) {
        // Redirect to appropriate dashboard based on user's actual role
        const redirectPath = getDashboardPath(userPermissions?.role);
        return <Navigate to={redirectPath} replace />;
    }

    return <>{children}</>;
};

// Helper function to get the appropriate dashboard path for each role
const getDashboardPath = (role?: UserRole): string => {
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

// Convenience components for specific roles
export const UserRoute: React.FC<{ children: ReactNode }> = ({ children }) => (
    <ProtectedRoute requiredRole={UserRole.USER}>
        {children}
    </ProtectedRoute>
);

export const AccountantRoute: React.FC<{ children: ReactNode }> = ({ children }) => (
    <ProtectedRoute requiredRole={UserRole.ACCOUNTANT}>
        {children}
    </ProtectedRoute>
);

export const AdminRoute: React.FC<{ children: ReactNode }> = ({ children }) => (
    <ProtectedRoute requiredRole={UserRole.ADMIN}>
        {children}
    </ProtectedRoute>
);

// Route for users with at least accountant role
export const AccountantOrAdminRoute: React.FC<{ children: ReactNode }> = ({ children }) => (
    <ProtectedRoute requiredRole={UserRole.ACCOUNTANT}>
        {children}
    </ProtectedRoute>
);

// Route for any authenticated user
export const AuthenticatedRoute: React.FC<{ children: ReactNode }> = ({ children }) => (
    <ProtectedRoute>
        {children}
    </ProtectedRoute>
); 