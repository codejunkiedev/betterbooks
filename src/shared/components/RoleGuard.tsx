import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { UserRole } from '@/shared/types/auth';
import { LoadingSpinner } from '@/shared/components/Loading';
import { useAppSelector } from '@/shared/hooks/useRedux';
import { getUserRoleFromDB } from '@/shared/services/supabase/auth';

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: UserRole[];
    fallbackPath?: string;
}

export default function RoleGuard({
    children,
    allowedRoles,
    fallbackPath = '/unauthorized'
}: RoleGuardProps) {
    const location = useLocation();
    const { user, isAuthenticated, loading } = useAppSelector(state => state.user);
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [roleLoading, setRoleLoading] = useState(true);

    // Get user role from database
    useEffect(() => {
        const fetchUserRole = async () => {
            if (user?.id) {
                try {
                    const role = await getUserRoleFromDB(user);
                    setUserRole(role);
                } catch (error) {
                    console.error('Error fetching user role:', error);
                    setUserRole('USER'); // Default to user on error
                }
            }
            setRoleLoading(false);
        };

        if (isAuthenticated && user) {
            fetchUserRole();
        } else {
            setRoleLoading(false);
        }
    }, [user, isAuthenticated]);

    // Show loading while checking authentication or role
    if (loading || roleLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <LoadingSpinner text="Checking permissions..." />
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated || !user) {
        // Determine appropriate login portal based on current route
        let loginPath = "/login"; // Default to user login
        if (location.pathname.startsWith("/accountant")) {
            loginPath = "/accountant/login";
        } else if (location.pathname.startsWith("/admin")) {
            loginPath = "/admin/login";
        }
        return <Navigate to={loginPath} state={{ from: location }} replace />;
    }

    // Check if user has required role
    if (!userRole || !allowedRoles.includes(userRole)) {
        return <Navigate to={fallbackPath} replace />;
    }

    return <>{children}</>;
}

// Helper component for specific role guards
export function UserGuard({ children }: { children: React.ReactNode }) {
    return <RoleGuard allowedRoles={['USER']} fallbackPath="/unauthorized">{children}</RoleGuard>;
}

export function AccountantGuard({ children }: { children: React.ReactNode }) {
    return <RoleGuard allowedRoles={['ACCOUNTANT']} fallbackPath="/unauthorized">{children}</RoleGuard>;
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
    return <RoleGuard allowedRoles={['ADMIN']} fallbackPath="/unauthorized">{children}</RoleGuard>;
}

export function AccountantOrAdminGuard({ children }: { children: React.ReactNode }) {
    return <RoleGuard allowedRoles={['ACCOUNTANT', 'ADMIN']} fallbackPath="/unauthorized">{children}</RoleGuard>;
} 