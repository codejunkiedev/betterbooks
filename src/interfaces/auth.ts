import { User, AuthError } from "@supabase/supabase-js";

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