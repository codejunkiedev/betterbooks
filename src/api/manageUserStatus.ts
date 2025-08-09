import { supabase } from '@/shared/services/supabase/client';
import { getCurrentUser } from '@/shared/services/supabase/auth';

export interface ManageUserStatusPayload {
    action: 'suspend' | 'reactivate';
    user_id: string;
    company_id: string;
    reason: string;
    notes?: string;
    notify_user: boolean;
    notify_accountant: boolean;
}

export async function manageUserStatus(payload: ManageUserStatusPayload) {
    const { user, error } = await getCurrentUser();
    if (error || !user) throw new Error('Not authenticated');

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error('No session');

    const response = await supabase.functions.invoke('manage-user-status', {
        body: {
            ...payload,
            actor_id: user.id,
        },
        headers: {
            Authorization: `Bearer ${session.access_token}`,
        },
    });

    if (response.error) throw new Error(response.error.message);
    return response.data;
} 