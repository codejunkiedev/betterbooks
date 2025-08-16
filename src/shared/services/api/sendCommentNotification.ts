import { supabase } from '@/shared/services/supabase/client';
import { getCurrentUser } from '@/shared/services/supabase/auth';
import { CommentNotificationData } from '@/shared/types/notification';

export const sendCommentNotification = async (notificationData: CommentNotificationData) => {
    try {
        const { user, error } = await getCurrentUser();
        const { data: { session } } = await supabase.auth.getSession();

        if (error || !user) {
            throw new Error('User not authenticated');
        }

        if (!session?.access_token) {
            throw new Error('No active session found');
        }

        const { company_id, sender_id, recipient_id, related_document_id, content, is_read } = notificationData;
        const response = await supabase.functions.invoke('send-comment-notification', {
            body: {
                company_id,
                sender_id,
                recipient_id,
                related_document_id,
                content,
                is_read,
            },
            headers: {
                'Authorization': `Bearer ${session.access_token}`
            }
        });

        if (response.error) {
            throw new Error(`Notification failed: ${response.error.message}`);
        }

        return response.data;
    } catch (error) {
        console.error('Error sending comment notification:', error);
        throw error;
    }
}; 