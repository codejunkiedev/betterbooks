import { supabase } from './client';
import { User, AuthError } from '@supabase/supabase-js';
import { AuthResponse, UserPermissions, UserRole, ROLE_PERMISSIONS } from '@/shared/types';
import { logger } from '@/shared/utils/logger';

export const getSession = async () => {
    const { data, error } = await supabase.auth.getSession();
    return {
        session: data.session || null,
        error: error,
    };
};

export const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        return {
            user: data.user,
            error: error,
        };
    } catch (error) {
        logger.error('Error signing in', error instanceof Error ? error : new Error(String(error)));
        return {
            user: null,
            error: error as AuthError,
        };
    }
};

export const signUp = async (email: string, password: string, fullName?: string): Promise<AuthResponse> => {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName
                }
            }
        });

        return {
            user: data.user,
            error: error,
        };
    } catch (error) {
        logger.error('Error signing up', error instanceof Error ? error : new Error(String(error)));
        return {
            user: null,
            error: error as AuthError,
        };
    }
};

export const signOut = async (): Promise<{ error: AuthError | null }> => {
    try {
        const { error } = await supabase.auth.signOut();
        return { error };
    } catch (error) {
        logger.error('Error signing out', error instanceof Error ? error : new Error(String(error)));
        return { error: error as AuthError };
    }
};

export const getCurrentUser = async (): Promise<User> => {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (!user) throw new Error('User not authenticated');
        return user;
    } catch (error) {
        logger.error('Error getting current user', error instanceof Error ? error : new Error(String(error)));
        throw error;
    }
};

export const resetPassword = async (email: string): Promise<{ error: AuthError | null }> => {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        return { error };
    } catch (error) {
        logger.error('Error resetting password', error instanceof Error ? error : new Error(String(error)));
        return { error: error as AuthError };
    }
};

export const updatePassword = async (newPassword: string): Promise<{ error: AuthError | null }> => {
    try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        return { error };
    } catch (error) {
        logger.error('Error updating password', error instanceof Error ? error : new Error(String(error)));
        return { error: error as AuthError };
    }
};

export const fetchUserPermissions = async (userId: string): Promise<UserPermissions | null> => {
    try {
        // First, check if user is an accountant
        const { data: accountantData } = await supabase
            .from('accountants')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (accountantData) {
            return {
                userId,
                role: UserRole.ACCOUNTANT,
                permissions: ROLE_PERMISSIONS[UserRole.ACCOUNTANT]
            };
        }

        // Check if user is an admin (you might have an admin table or flag)
        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        // For now, let's assume admin role is determined by email domain or a flag
        // You can modify this logic based on your admin identification strategy
        if (profileData?.email?.endsWith('@betterbooks.com')) {
            return {
                userId,
                role: UserRole.ADMIN,
                permissions: ROLE_PERMISSIONS[UserRole.ADMIN]
            };
        }

        // Check if user has a company (regular user)
        const { data: companyData } = await supabase
            .from('companies')
            .select('id, assigned_accountant_id')
            .eq('user_id', userId)
            .single();

        if (companyData) {
            return {
                userId,
                role: UserRole.USER,
                permissions: ROLE_PERMISSIONS[UserRole.USER],
                companyId: companyData.id,
                assignedAccountantId: companyData.assigned_accountant_id
            };
        }

        // Default to USER role if no specific role is found
        return {
            userId,
            role: UserRole.USER,
            permissions: ROLE_PERMISSIONS[UserRole.USER]
        };

    } catch (error) {
        logger.error('Error fetching user permissions', error instanceof Error ? error : new Error(String(error)));
        return null;
    }
};
