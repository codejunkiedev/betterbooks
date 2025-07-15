import { User, AuthError } from "@supabase/supabase-js";

export type UserRole = 'USER' | 'ACCOUNTANT' | 'ADMIN';

export interface SignInPayload {
    email: string;
    password: string;
}

export interface SignUpPayload {
    email: string;
    password: string;
}

export interface AuthResponse {
    user: User | null;
    error: AuthError | null;
}

export interface AuthUser extends User {
    role?: UserRole;
}

export interface RoleBasedAuthState {
    user: AuthUser | null;
    role: UserRole | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}