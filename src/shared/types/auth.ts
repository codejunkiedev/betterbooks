import { User, AuthError } from "@supabase/supabase-js";

export enum UserRoleEnum {
    USER = 'USER',
    ACCOUNTANT = 'ACCOUNTANT',
    ADMIN = 'ADMIN'
}

export type UserRole = UserRoleEnum;

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