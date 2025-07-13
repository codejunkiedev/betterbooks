import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/shared/services/supabase/client';
import {
    getSession,
    signIn as authSignIn,
    signUp as authSignUp,
    signOut as authSignOut,
    resetPassword,
    updatePassword,
    fetchUserPermissions
} from '@/shared/services/supabase/auth';
import { UserRole, Permission, UserPermissions } from '@/shared/types';
import { logger } from '@/shared/utils/logger';

export interface AuthContextType {
    user: User | null;
    userPermissions: UserPermissions | null;
    loading: boolean;
    isLoading: boolean;
    error: string | null;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
    login: (credentials: { email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
    register: (credentials: { email: string; password: string; fullName: string }) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    requestPasswordReset: (request: { email: string }) => Promise<{ success: boolean; error?: string }>;
    confirmPasswordReset: (request: { password: string; token: string }) => Promise<{ success: boolean; error?: string }>;
    clearError: () => void;
    refreshUserPermissions: () => Promise<void>;
    hasPermission: (permission: Permission) => boolean;
    hasAnyPermission: (permissions: Permission[]) => boolean;
    hasAllPermissions: (permissions: Permission[]) => boolean;
    isRole: (role: UserRole) => boolean;
    isAtLeastRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userPermissions, setUserPermissions] = useState<UserPermissions | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refreshUserPermissions = async () => {
        if (user) {
            const permissions = await fetchUserPermissions(user.id);
            setUserPermissions(permissions);
        }
    };

    const signIn = async (email: string, password: string) => {
        const { user, error } = await authSignIn(email, password);
        if (user) {
            setUser(user);
            const permissions = await fetchUserPermissions(user.id);
            setUserPermissions(permissions);
        }
        return { error };
    };

    const signUp = async (email: string, password: string, fullName: string) => {
        const { user, error } = await authSignUp(email, password, fullName);
        if (user) {
            setUser(user);
            const permissions = await fetchUserPermissions(user.id);
            setUserPermissions(permissions);
        }
        return { error };
    };

    const signOut = async () => {
        await authSignOut();
        setUser(null);
        setUserPermissions(null);
    };

    // Alias methods for compatibility
    const login = async (credentials: { email: string; password: string }) => {
        const { user, error } = await authSignIn(credentials.email, credentials.password);
        if (user) {
            setUser(user);
            const permissions = await fetchUserPermissions(user.id);
            setUserPermissions(permissions);
        }
        return error ? { success: false, error: error.message } : { success: true };
    };

    const register = async (credentials: { email: string; password: string; fullName: string }) => {
        const { user, error } = await authSignUp(credentials.email, credentials.password, credentials.fullName);
        if (user) {
            setUser(user);
            const permissions = await fetchUserPermissions(user.id);
            setUserPermissions(permissions);
        }
        return error ? { success: false, error: error.message } : { success: true };
    };

    const logout = signOut;

    const requestPasswordReset = async (request: { email: string }) => {
        const { error } = await resetPassword(request.email);
        return error ? { success: false, error: error.message } : { success: true };
    };

    const confirmPasswordReset = async (request: { password: string; token: string }) => {
        const { error } = await updatePassword(request.password);
        return error ? { success: false, error: error.message } : { success: true };
    };

    const clearError = () => {
        setError(null);
    };

    // Permission checking methods
    const hasPermission = (permission: Permission): boolean => {
        if (!userPermissions) return false;
        return userPermissions.permissions.includes(permission);
    };

    const hasAnyPermission = (permissions: Permission[]): boolean => {
        if (!userPermissions) return false;
        return permissions.some(permission =>
            userPermissions.permissions.includes(permission)
        );
    };

    const hasAllPermissions = (permissions: Permission[]): boolean => {
        if (!userPermissions) return false;
        return permissions.every(permission =>
            userPermissions.permissions.includes(permission)
        );
    };

    const isRole = (role: UserRole): boolean => {
        if (!userPermissions) return false;
        return userPermissions.role === role;
    };

    const isAtLeastRole = (role: UserRole): boolean => {
        if (!userPermissions) return false;
        const roleHierarchy = {
            [UserRole.USER]: 1,
            [UserRole.ACCOUNTANT]: 2,
            [UserRole.ADMIN]: 3
        };
        return roleHierarchy[userPermissions.role] >= roleHierarchy[role];
    };

    useEffect(() => {
        // Get initial session
        const getInitialSession = async () => {
            try {
                logger.info('Attempting to get initial session...');

                // Debug environment variables
                logger.info('Environment check', {
                    supabaseUrl: import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Missing',
                    supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
                    mode: import.meta.env.MODE
                });

                // Add timeout to prevent infinite loading (increased to 15 seconds)
                const timeoutPromise = new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error('Connection timeout - Supabase service may be unavailable')), 15000)
                );

                const sessionPromise = getSession();
                const result = await Promise.race([sessionPromise, timeoutPromise]);
                const { session, error } = result;

                if (error) {
                    logger.error('Supabase auth error', error);
                    throw error;
                }

                logger.info('Session retrieved successfully', { hasSession: !!session });
                setUser(session?.user ?? null);

                if (session?.user) {
                    logger.info('Fetching user permissions', { userId: session.user.id });
                    const permissions = await fetchUserPermissions(session.user.id);
                    setUserPermissions(permissions);
                }

                setLoading(false);
            } catch (error) {
                logger.error('Error getting initial session', error instanceof Error ? error : new Error(String(error)));

                let errorMessage = 'Failed to connect to authentication service.';

                if (error instanceof Error) {
                    if (error.message.includes('timeout')) {
                        errorMessage = 'Connection timeout. Please check your internet connection and try again.';
                    } else if (error.message.includes('fetch')) {
                        errorMessage = 'Network error. Please check your internet connection.';
                    } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
                        errorMessage = 'Authentication error. Please check your Supabase configuration.';
                    } else {
                        errorMessage = `Authentication error: ${error.message}`;
                    }
                }

                setError(errorMessage);
                setLoading(false);
            }
        };

        getInitialSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                try {
                    logger.info('Auth state changed', { event: _event, hasSession: !!session });
                    setUser(session?.user ?? null);

                    if (session?.user) {
                        const permissions = await fetchUserPermissions(session.user.id);
                        setUserPermissions(permissions);
                    } else {
                        setUserPermissions(null);
                    }

                    setLoading(false);
                } catch (error) {
                    logger.error('Error in auth state change', error instanceof Error ? error : new Error(String(error)));
                    setError('Authentication error occurred. Please try refreshing the page.');
                    setLoading(false);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const value: AuthContextType = {
        user,
        userPermissions,
        loading,
        isLoading: loading,
        error,
        signIn,
        signUp,
        signOut,
        login,
        register,
        logout,
        requestPasswordReset,
        confirmPasswordReset,
        clearError,
        refreshUserPermissions,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        isRole,
        isAtLeastRole
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Export both AuthContext and AuthProvider
export { AuthContext }; 