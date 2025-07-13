import { User, AuthError } from "@supabase/supabase-js";
import { UserRole } from "./roles";

export interface SignInPayload {
    email: string;
    password: string;
}

export interface SignUpPayload {
    email: string;
    password: string;
    fullName: string;
    role?: UserRole; // Optional during signup, will be set by admin
}

export interface AuthResponse {
    user: User | null;
    error: AuthError | null;
}

export interface UserProfile {
    id: string;
    full_name: string;
    avatar_url?: string;
    role: UserRole;
    created_at: string;
    updated_at: string;
}

export interface AuthState {
    user: AuthUser | null;
    profile: UserProfile | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;
}

// Additional types for auth service
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    email: string;
    password: string;
    fullName: string;
    companyName?: string;
    companyType?: string;
}

export interface AuthUser {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    companyId?: string;
    companyName?: string;
    companyType?: string;
    avatarUrl?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PasswordResetRequest {
    email: string;
}

export interface PasswordResetConfirm {
    password: string;
    token: string;
}

export interface AuthEvent {
    type: 'LOGIN' | 'LOGOUT' | 'REGISTER' | 'PASSWORD_RESET';
    payload: Record<string, unknown>;
    timestamp: Date;
}

export type AuthEventCallback = (event: AuthEvent) => void;