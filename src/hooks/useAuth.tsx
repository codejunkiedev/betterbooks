import { useState, useEffect, createContext, useContext, useCallback, useMemo } from 'react';
import { AuthUser } from '../core/domain/services/IAuthService';
import { SupabaseAuthService } from '../infrastructure/services/SupabaseAuthService';
import { useToast } from './use-toast';
import { UserRole } from '../core/domain/entities/User';

interface AuthContextType {
    user: AuthUser | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    signUp: (email: string, password: string, fullName: string, role: string) => Promise<boolean>;
    logout: () => Promise<void>;
    updateProfile: (fullName: string, avatarUrl?: string) => Promise<boolean>;
    requestPasswordReset: (email: string) => Promise<boolean>;
    resetPassword: (token: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    // Memoized auth service instance
    const authService = useMemo(() => new SupabaseAuthService(), []);

    // Memoized check current user function
    const checkCurrentUser = useCallback(async () => {
        try {
            const result = await authService.getCurrentUser();
            if (result.isSuccess) {
                setUser(result.value);
            }
        } catch (error) {
            console.error('Error checking current user:', error);
        } finally {
            setIsLoading(false);
        }
    }, [authService]);

    // Check current user on mount
    useEffect(() => {
        checkCurrentUser();
    }, [checkCurrentUser]);

    // Memoized login function
    const login = useCallback(async (email: string, password: string): Promise<boolean> => {
        try {
            setIsLoading(true);
            const result = await authService.login({ email, password });

            if (result.isSuccess) {
                setUser(result.value);
                toast({
                    title: "Welcome back!",
                    description: `Hello, ${result.value.fullName}`,
                });
                return true;
            } else {
                toast({
                    title: "Login Failed",
                    description: result.error,
                    variant: "destructive"
                });
                return false;
            }
        } catch {
            toast({
                title: "Login Failed",
                description: "An unexpected error occurred",
                variant: "destructive"
            });
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [authService, toast]);

    // Memoized sign up function
    const signUp = useCallback(async (email: string, password: string, fullName: string, role: string): Promise<boolean> => {
        try {
            setIsLoading(true);
            const result = await authService.signUp({
                email,
                password,
                fullName,
                role: role as UserRole
            });

            if (result.isSuccess) {
                setUser(result.value);
                toast({
                    title: "Account Created",
                    description: "Welcome to BetterBooks!",
                });
                return true;
            } else {
                toast({
                    title: "Sign Up Failed",
                    description: result.error,
                    variant: "destructive"
                });
                return false;
            }
        } catch {
            toast({
                title: "Sign Up Failed",
                description: "An unexpected error occurred",
                variant: "destructive"
            });
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [authService, toast]);

    // Memoized logout function
    const logout = useCallback(async (): Promise<void> => {
        try {
            setIsLoading(true);
            const result = await authService.logout();

            if (result.isSuccess) {
                setUser(null);
                toast({
                    title: "Logged Out",
                    description: "You have been successfully logged out",
                });
            } else {
                toast({
                    title: "Logout Failed",
                    description: result.error,
                    variant: "destructive"
                });
            }
        } catch {
            toast({
                title: "Logout Failed",
                description: "An unexpected error occurred",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }, [authService, toast]);

    // Memoized update profile function
    const updateProfile = useCallback(async (fullName: string, avatarUrl?: string): Promise<boolean> => {
        if (!user) return false;

        try {
            setIsLoading(true);
            const result = await authService.updateProfile(user.id, fullName, avatarUrl);

            if (result.isSuccess) {
                setUser({ ...user, fullName: result.value.fullName, avatarUrl: result.value.avatarUrl });
                toast({
                    title: "Profile Updated",
                    description: "Your profile has been updated successfully",
                });
                return true;
            } else {
                toast({
                    title: "Update Failed",
                    description: result.error,
                    variant: "destructive"
                });
                return false;
            }
        } catch {
            toast({
                title: "Update Failed",
                description: "An unexpected error occurred",
                variant: "destructive"
            });
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [authService, toast, user]);

    // Memoized request password reset function
    const requestPasswordReset = useCallback(async (email: string): Promise<boolean> => {
        try {
            setIsLoading(true);
            const result = await authService.requestPasswordReset({ email });

            if (result.isSuccess) {
                toast({
                    title: "Reset Email Sent",
                    description: "Check your email for password reset instructions",
                });
                return true;
            } else {
                toast({
                    title: "Reset Failed",
                    description: result.error,
                    variant: "destructive"
                });
                return false;
            }
        } catch {
            toast({
                title: "Reset Failed",
                description: "An unexpected error occurred",
                variant: "destructive"
            });
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [authService, toast]);

    // Memoized reset password function
    const resetPassword = useCallback(async (token: string, newPassword: string): Promise<boolean> => {
        try {
            setIsLoading(true);
            const result = await authService.resetPassword(token, newPassword);

            if (result.isSuccess) {
                toast({
                    title: "Password Reset",
                    description: "Your password has been reset successfully",
                });
                return true;
            } else {
                toast({
                    title: "Reset Failed",
                    description: result.error,
                    variant: "destructive"
                });
                return false;
            }
        } catch {
            toast({
                title: "Reset Failed",
                description: "An unexpected error occurred",
                variant: "destructive"
            });
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [authService, toast]);

    // Memoized context value
    const value = useMemo<AuthContextType>(() => ({
        user,
        isLoading,
        login,
        signUp,
        logout,
        updateProfile,
        requestPasswordReset,
        resetPassword
    }), [user, isLoading, login, signUp, logout, updateProfile, requestPasswordReset, resetPassword]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}; 