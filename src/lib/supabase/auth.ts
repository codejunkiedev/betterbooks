import { supabase } from './client';
import { User, AuthError } from '@supabase/supabase-js';
import { AuthResponse } from '@/interfaces/auth';

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
        console.error('Error signing in:', error);
        return {
            user: null,
            error: error as AuthError,
        };
    }
};

export const signUp = async (email: string, password: string): Promise<AuthResponse> => {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        return {
            user: data.user,
            error: error,
        };
    } catch (error) {
        console.error('Error signing up:', error);
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
        console.error('Error signing out:', error);
        return { error: error as AuthError };
    }
};

export const getCurrentUser = async (): Promise<{ user: User | null; error: AuthError | null }> => {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        return { user, error };
    } catch (error) {
        console.error('Error getting current user:', error);
        return { user: null, error: error as AuthError };
    }
};

export const resetPassword = async (email: string): Promise<{ error: AuthError | null }> => {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        return { error };
    } catch (error) {
        console.error('Error resetting password:', error);
        return { error: error as AuthError };
    }
};

export const updatePassword = async (newPassword: string): Promise<{ error: AuthError | null }> => {
    try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        return { error };
    } catch (error) {
        console.error('Error updating password:', error);
        return { error: error as AuthError };
    }
};
