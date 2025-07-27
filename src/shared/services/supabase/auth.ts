import { supabase } from './client';
import { AuthResponse, SignInPayload, SignUpPayload, UserRole } from '@/shared/types/auth';
import { User } from '@supabase/supabase-js';
import { getUserRoleFromDatabase } from './roles';
import { getCompanyByUserId } from './company';
import { ActivityType } from '@/shared/types';
import { logActivity } from '@/shared/utils/activity';

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

    // Log successful signup activity
    if (data.user && !error) {
        try {
            // For new signups, company_id will be null since they haven't created a company yet
            logActivity(
                null, // company_id is null for new signup activities
                data.user.id,
                'USER_LOGIN', // Using USER_LOGIN for new registrations too
                data.user.email || 'unknown',
                'new_registration',
                { is_new_user: true }
            );
        } catch (activityError) {
            // Don't fail the signup if activity logging fails
            console.error('Failed to log signup activity:', activityError);
        }
    }

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

    // Log successful login activity
    if (data.user && !error) {
        try {
            let companyId = null;
            try {
                const company = await getCompanyByUserId(data.user.id);
                companyId = company?.id || null;
            } catch (companyError) {
                // User might not have a company yet, which is fine
                console.log('User has no company or company fetch failed:', companyError);
            }

            logActivity(
                companyId,
                data.user.id,
                ActivityType.USER_LOGIN,
                data.user.email || 'unknown',
                'email_password'
            );
        } catch (activityError) {
            // Don't fail the login if activity logging fails
            console.error('Failed to log login activity:', activityError);
        }
    }

    return {
        user: data.user,
        error: error,
    };
};

export const signOut = async () => {
    // Get current user before signing out
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.auth.signOut();

    // Log sign out activity
    if (user && !error) {
        try {
            // Get user's company ID
            let companyId = null;
            try {
                const company = await getCompanyByUserId(user.id);
                companyId = company?.id || null;
            } catch (companyError) {
                // User might not have a company yet, which is fine
                console.log('User has no company or company fetch failed:', companyError);
            }

            logActivity(
                companyId, // Pass the actual company_id if available
                user.id,
                ActivityType.USER_LOGOUT,
                user.email || 'unknown',
                'logout'
            );
        } catch (activityError) {
            // Don't fail the signout if activity logging fails
            console.error('Failed to log signout activity:', activityError);
        }
    }

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
