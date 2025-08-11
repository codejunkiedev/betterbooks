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
        .maybeSingle();

    // Get document and company information
    const { data: documentData, error: documentError } = await supabase
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

    if (documentError || !documentData) {
        throw new Error('Document not found');
    }

    const company = documentData?.companies as unknown as CompanyData;
    const isAccountant = !!accountantData;

    console.log('Document data:', documentData);
    console.log('Company data:', company);
    console.log('Is accountant:', isAccountant);
    console.log('Accountant data:', accountantData);

    let recipientId: string;

    if (isAccountant) {
        // Author is accountant, send to company owner
        if (!company.user_id) {
            throw new Error('Company owner not found');
        }
        recipientId = company.user_id;
    } else {
        // Author is user, send to assigned accountant
        // For user replies, we should send to the assigned accountant if they exist
        if (company.assigned_accountant_id) {
            // Get the accountant's user ID
            const { data: accountantUserData, error: accountantUserError } = await supabase
                .from('accountants')
                .select('user_id')
                .eq('id', company.assigned_accountant_id)
                .eq('is_active', true)
                .single();

            if (accountantUserError || !accountantUserData) {
                throw new Error('Assigned accountant not found or inactive');
            }
            recipientId = accountantUserData.user_id;
        } else {
            // If no accountant assigned, this shouldn't happen for user replies
            // but fallback to company owner
            if (company.user_id) {
                recipientId = company.user_id;
            } else {
                throw new Error('No valid recipient found for this message');
            }
        }
    }

    console.log('Final recipientId:', recipientId);
    console.log('Final companyId:', documentData.company_id);

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
        console.log('Starting createDocumentMessage with data:', messageData);
        
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
            throw new Error('User not authenticated');
        }

        console.log('Current user authenticated:', userData.user.id);

        // Get recipient information
        const { companyId, recipientId } = await getDocumentMessageRecipient(userData.user.id, messageData.document_id);

        console.log('Retrieved companyId:', companyId);
        console.log('Retrieved recipientId:', recipientId);
        console.log('Document ID:', messageData.document_id);
        console.log('Current user ID:', userData.user.id);

        // Validate all required fields
        if (!companyId) {
            throw new Error('Company ID not found');
        }
        if (!recipientId) {
            throw new Error('Recipient ID not found');
        }
        if (!messageData.document_id) {
            throw new Error('Document ID is required');
        }
        if (!messageData.content?.trim()) {
            throw new Error('Message content is required');
        }

        const messagePayload = {
            company_id: companyId,
            sender_id: userData.user.id,
            recipient_id: recipientId,
            related_document_id: messageData.document_id,
            content: messageData.content.trim(),
            is_read: false,
        }

        console.log('Creating message with payload:', messagePayload);

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
            console.error('Message payload that failed:', messagePayload);
            console.error('User ID:', userData.user.id);
            console.error('Company ID:', companyId);
            console.error('Recipient ID:', recipientId);
            console.error('Document ID:', messageData.document_id);
            return { data: null, error };
        }

        console.log('Message created successfully:', data);

        const enrichedMessage: DocumentMessage = {
            ...data,
            sender_name: 'You',
            recipient_name: 'Recipient',
            is_own_message: true,
        };

        // Send notification asynchronously - don't block the message creation
        sendCommentNotification(messagePayload).catch((notificationError) => {
            console.error('Error sending comment notification (non-blocking):', notificationError);
            // Don't throw error here as the message was created successfully
        });

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