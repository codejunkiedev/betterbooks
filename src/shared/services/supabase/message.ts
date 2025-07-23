import { sendCommentNotification } from '@/api/sendCommentNotification';
import { supabase } from './client';
import {
    Message,
    UpdateMessageData,
    MessageListResponse,
    MessageResponse,
    CreateDocumentMessageData,
    DocumentMessage
} from '@/shared/types/message';

interface CompanyData {
    user_id: string;
    assigned_accountant_id: string | null;
}

// Helper function to determine recipient for document messages
const getDocumentMessageRecipient = async (userId: string, documentId: string) => {
    // Check if user is an accountant
    const { data: accountantData } = await supabase
        .from('accountants')
        .select('id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

    // Get document and company information
    const { data: documentData } = await supabase
        .from('documents')
        .select(`
            company_id,
            companies!inner (
                user_id,
                assigned_accountant_id
            )
        `)
        .eq('id', documentId)
        .single();

    if (!documentData) {
        throw new Error('Document not found');
    }

    const company = documentData?.companies as unknown as CompanyData;
    const isAccountant = !!accountantData;

    let recipientId: string;

    if (isAccountant) {
        // Author is accountant, send to company owner
        recipientId = company.user_id;
    } else {
        // Author is user, send to assigned accountant
        recipientId = company.assigned_accountant_id || company.user_id;
    }

    return {
        companyId: documentData.company_id,
        recipientId,
        isAccountant
    };
};

// Get all messages for a specific document (document comments)
export const getDocumentMessages = async (documentId: string): Promise<{ data: DocumentMessage[] | null; error: Error | null }> => {
    try {
        const { data, error } = await supabase
            .from('messages')
            .select(`
                id,
                company_id,
                sender_id,
                recipient_id,
                related_document_id,
                content,
                is_read,
                created_at,
                updated_at
            `)
            .eq('related_document_id', documentId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching document messages:', error);
            return { data: null, error };
        }

        // Enrich messages with sender/recipient information
        const { data: userData } = await supabase.auth.getUser();
        const currentUserId = userData.user?.id;

        const enrichedMessages = await Promise.all((data || []).map(async (message) => {
            return {
                ...message,
                sender_name: message.sender_id === currentUserId ? 'You' : 'Recipient',
                is_own_message: message.sender_id === currentUserId,
            } as DocumentMessage;
        }));

        return { data: enrichedMessages, error: null };
    } catch (err) {
        console.error('Error in getDocumentMessages:', err);
        return { data: null, error: err as Error };
    }
};

// Create a new document message (comment)
export const createDocumentMessage = async (messageData: CreateDocumentMessageData): Promise<MessageResponse> => {
    try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
            throw new Error('User not authenticated');
        }

        // Get recipient information
        const { companyId, recipientId } = await getDocumentMessageRecipient(userData.user.id, messageData.document_id);

        const messagePayload = {
            company_id: companyId,
            sender_id: userData.user.id,
            recipient_id: recipientId,
            related_document_id: messageData.document_id,
            content: messageData.content,
            is_read: false,
        }

        const { data, error } = await supabase
            .from('messages')
            .insert(messagePayload)
            .select(`
                id,
                company_id,
                sender_id,
                recipient_id,
                related_document_id,
                content,
                is_read,
                created_at,
                updated_at
            `)
            .single();

        if (error) {
            console.error('Error creating document message:', error);
            return { data: null, error };
        }

        const enrichedMessage: DocumentMessage = {
            ...data,
            sender_name: 'You',
            recipient_name: 'Recipient',
            is_own_message: true,
        };

        try {
            await sendCommentNotification(messagePayload);

        } catch (error) {
            console.error('Error in send notification:', error);
        }

        return { data: enrichedMessage, error: null };
    } catch (err) {
        console.error('Error in createDocumentMessage:', err);
        return { data: null, error: err as Error };
    }
};

// Update an existing message
export const updateMessage = async (messageId: string, updateData: UpdateMessageData): Promise<MessageResponse> => {
    try {
        const { data, error } = await supabase
            .from('messages')
            .update(updateData)
            .eq('id', messageId)
            .select(`
                id,
                company_id,
                sender_id,
                recipient_id,
                related_document_id,
                content,
                is_read,
                created_at,
                updated_at
            `)
            .single();

        if (error) {
            console.error('Error updating message:', error);
            return { data: null, error };
        }

        // Create enriched message with proper names
        const { data: userData } = await supabase.auth.getUser();


        const enrichedMessage: Message = {
            ...data,
            sender_name: data.sender_id === userData.user?.id ? 'You' : 'Recipient',
            is_own_message: data.sender_id === userData.user?.id,
        };

        return { data: enrichedMessage, error: null };
    } catch (err) {
        console.error('Error in updateMessage:', err);
        return { data: null, error: err as Error };
    }
};

// Delete a message
export const deleteMessage = async (messageId: string): Promise<{ error: Error | null }> => {
    try {
        const { error } = await supabase
            .from('messages')
            .delete()
            .eq('id', messageId);

        if (error) {
            console.error('Error deleting message:', error);
            return { error };
        }

        return { error: null };
    } catch (err) {
        console.error('Error in deleteMessage:', err);
        return { error: err as Error };
    }
};

// Get message count for a document
export const getDocumentMessageCount = async (documentId: string): Promise<{ count: number; error: Error | null }> => {
    try {
        const { count, error } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('related_document_id', documentId);

        if (error) {
            console.error('Error getting document message count:', error);
            return { count: 0, error };
        }

        return { count: count || 0, error: null };
    } catch (err) {
        console.error('Error in getDocumentMessageCount:', err);
        return { count: 0, error: err as Error };
    }
};

// Get all messages for a user (general messaging)
export const getUserMessages = async (): Promise<MessageListResponse> => {
    try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
            throw new Error('User not authenticated');
        }

        const { data, error } = await supabase
            .from('messages')
            .select(`
                id,
                company_id,
                sender_id,
                recipient_id,
                related_document_id,
                content,
                is_read,
                created_at,
                updated_at
            `)
            .or(`sender_id.eq.${userData.user.id},recipient_id.eq.${userData.user.id}`)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching user messages:', error);
            return { data: null, error };
        }

        // Enrich messages with sender/recipient information
        const enrichedMessages = await Promise.all((data || []).map(async (message) => {

            // Get document name if related
            let documentName: string | undefined;
            if (message.related_document_id) {
                const { data: documentData } = await supabase
                    .from('documents')
                    .select('original_filename')
                    .eq('id', message.related_document_id)
                    .single();
                documentName = documentData?.original_filename;
            }

            return {
                ...message,
                sender_name: message.sender_id === userData.user?.id ? 'You' : 'Recipient',
                is_own_message: message.sender_id === userData.user?.id,
                document_name: documentName,
            } as Message;
        }));

        return { data: enrichedMessages, error: null };
    } catch (err) {
        console.error('Error in getUserMessages:', err);
        return { data: null, error: err as Error };
    }
};

// Mark message as read
export const markMessageAsRead = async (messageId: string): Promise<{ error: Error | null }> => {
    try {
        const { error } = await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('id', messageId);

        if (error) {
            console.error('Error marking message as read:', error);
            return { error };
        }

        return { error: null };
    } catch (err) {
        console.error('Error in markMessageAsRead:', err);
        return { error: err as Error };
    }
};

// Get unread message count for a user
export const getUnreadMessageCount = async (): Promise<{ count: number; error: Error | null }> => {
    try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
            throw new Error('User not authenticated');
        }

        const { count, error } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('recipient_id', userData.user.id)
            .eq('is_read', false);

        if (error) {
            console.error('Error getting unread message count:', error);
            return { count: 0, error };
        }

        return { count: count || 0, error: null };
    } catch (err) {
        console.error('Error in getUnreadMessageCount:', err);
        return { count: 0, error: err as Error };
    }
}; 