import { supabase } from './client';
import { AuthResponse, SignInPayload, SignUpPayload, UserRole } from '@/shared/types/auth';
import { User } from '@supabase/supabase-js';
import { getUserRoleFromDatabase } from './roles';

export const signUp = async (payload: SignUpPayload): Promise<AuthResponse> => {
    const { data, error } = await supabase.auth.signUp({
        email: payload.email,
        password: payload.password,
        options: {
            data: {
                role: 'USER' // Default role for new signups
            }
        }
    });

    return {
        user: data.user,
        error: error,
    };
};

export const signIn = async (payload: SignInPayload): Promise<AuthResponse> => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: payload.email,
        password: payload.password,
    });

    return {
        user: data.user,
        error: error,
    };
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
};

export const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
};

export const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({
        password: password,
    });
    return { error };
};

// Update user role (for testing/admin purposes)
export const updateUserRole = async (role: UserRole) => {
    const { error } = await supabase.auth.updateUser({
        data: { role }
    });
    return { error };
};

export const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
};

export const getCurrentSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
};

// Helper function to get user role (fallback to metadata)
export const getUserRole = (user: User | null): UserRole => {
    return user?.user_metadata?.role || 'USER';
};

// Helper function to get user role from database
export const getUserRoleFromDB = async (user: User | null): Promise<UserRole> => {
    if (!user?.id) return 'USER';
    return await getUserRoleFromDatabase(user.id);
};

// Helper function to get role-based redirect path
export const getRoleBasedRedirectPath = (role: UserRole): string => {
    switch (role) {
        case 'ADMIN':
            return '/admin';
        case 'ACCOUNTANT':
            return '/accountant';
        case 'USER':
        default:
            return '/';
    }
};

// Helper function to check if user has required role
export const hasRole = (user: User | null, requiredRole: UserRole): boolean => {
    const userRole = getUserRole(user);
    return userRole === requiredRole;
};

// Helper function to check if user has any of the required roles
export const hasAnyRole = (user: User | null, requiredRoles: UserRole[]): boolean => {
    const userRole = getUserRole(user);
    return requiredRoles.includes(userRole);
};
