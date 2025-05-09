import { supabase } from "@/lib/supabase";
import { SignInPayload, SignUpPayload } from "@/interfaces/auth";

export async function getSession() {
    return supabase.auth.getSession();
}

export async function signOut() {
    return supabase.auth.signOut();
}

export async function signIn(payload: SignInPayload) {
    return supabase.auth.signInWithPassword(payload);
}

export async function signUp(payload: SignUpPayload) {
    return supabase.auth.signUp(payload);
}

export async function resetPassword(email: string) {
    return supabase.auth.resetPasswordForEmail(email);
}

export async function updatePassword(newPassword: string) {
    return supabase.auth.updateUser({ password: newPassword });
}
