import { supabase } from './client';
import { UserRole } from '@/shared/types/auth';

// Check user role from database tables
export const getUserRoleFromDatabase = async (userId: string): Promise<UserRole> => {
    try {
        // Check if user is an admin
        const { data: adminData, error: adminError } = await supabase
            .from('admins')
            .select('id, is_active')
            .eq('user_id', userId)
            .eq('is_active', true)
            .maybeSingle();

        if (!adminError && adminData) {
            return 'ADMIN';
        }

        // Check if user is an accountant
        const { data: accountantData, error: accountantError } = await supabase
            .from('accountants')
            .select('id, is_active')
            .eq('user_id', userId)
            .eq('is_active', true)
            .maybeSingle();

        if (!accountantError && accountantData) {
            return 'ACCOUNTANT';
        }

        // Default to user role
        return 'USER';
    } catch (error) {
        console.error('Error checking user role from database:', error);
        return 'USER'; // Default to user role on error
    }
};

// Create admin record
export const createAdminRecord = async (userId: string, accessLevel: string = 'admin') => {
    const { data, error } = await supabase
        .from('admins')
        .insert({
            user_id: userId,
            access_level: accessLevel,
            is_active: true
        })
        .select()
        .single();

    return { data, error };
};

// Create accountant record
export const createAccountantRecord = async (userId: string, licenseNumber?: string, firmName?: string) => {
    const { data, error } = await supabase
        .from('accountants')
        .insert({
            user_id: userId,
            license_number: licenseNumber,
            firm_name: firmName,
            is_active: true
        })
        .select()
        .single();

    return { data, error };
};

// Get admin details
export const getAdminDetails = async (userId: string) => {
    const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();

    return { data, error };
};

// Get accountant details
export const getAccountantDetails = async (userId: string) => {
    const { data, error } = await supabase
        .from('accountants')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();

    return { data, error };
};

// Update admin status
export const updateAdminStatus = async (userId: string, isActive: boolean) => {
    const { data, error } = await supabase
        .from('admins')
        .update({ is_active: isActive })
        .eq('user_id', userId)
        .select()
        .single();

    return { data, error };
};

// Update accountant status
export const updateAccountantStatus = async (userId: string, isActive: boolean) => {
    const { data, error } = await supabase
        .from('accountants')
        .update({ is_active: isActive })
        .eq('user_id', userId)
        .select()
        .single();

    return { data, error };
}; 