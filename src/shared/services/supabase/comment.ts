import { supabase } from './client';
import {
    DocumentComment,
    CreateCommentData,
    UpdateCommentData,
    CommentListResponse,
    CommentResponse
} from '@/shared/types/comment';

// Get all comments for a specific document
export const getCommentsByDocumentId = async (documentId: string): Promise<CommentListResponse> => {
    try {
        const { data, error } = await supabase
            .from('document_comments')
            .select(`
                id,
                document_id,
                author_id,
                content,
                created_at,
                updated_at
            `)
            .eq('document_id', documentId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching comments:', error);
            return { data: null, error };
        }

        // Enrich comments with author information
        const { data: userData } = await supabase.auth.getUser();
        const currentUserId = userData.user?.id;

        const enrichedComments = (data || []).map((comment) => {
            return {
                ...comment,
                author_name: comment.author_id === currentUserId ? 'You' : 'User',
                author_email: '',
                is_own_comment: comment.author_id === currentUserId,
            } as DocumentComment;
        });

        return { data: enrichedComments, error: null };
    } catch (err) {
        console.error('Error in getCommentsByDocumentId:', err);
        return { data: null, error: err as Error };
    }
};

// Create a new comment
export const createComment = async (commentData: CreateCommentData): Promise<CommentResponse> => {
    try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
            throw new Error('User not authenticated');
        }

        const { data, error } = await supabase
            .from('document_comments')
            .insert({
                document_id: commentData.document_id,
                author_id: userData.user.id,
                content: commentData.content,
            })
            .select(`
                id,
                document_id,
                author_id,
                content,
                created_at,
                updated_at
            `)
            .single();

        if (error) {
            console.error('Error creating comment:', error);
            return { data: null, error };
        }

        // Create enriched comment for the new comment
        const enrichedComment: DocumentComment = {
            ...data,
            author_name: 'You',
            author_email: userData.user.email || '',
            is_own_comment: true,
        };

        // Send email notification
        try {
            // Get document details for notification
            const { data: documentData } = await supabase
                .from('documents')
                .select('original_filename')
                .eq('id', commentData.document_id)
                .single();

            if (documentData) {
                await supabase.functions.invoke('send-comment-notification', {
                    body: {
                        document_id: commentData.document_id,
                    },
                });
            }
        } catch (notificationError) {
            // Don't fail the comment creation if notification fails
            console.warn('Failed to send notification:', notificationError);
        }

        return { data: enrichedComment, error: null };
    } catch (err) {
        console.error('Error in createComment:', err);
        return { data: null, error: err as Error };
    }
};

// Update an existing comment
export const updateComment = async (commentId: string, updateData: UpdateCommentData): Promise<CommentResponse> => {
    try {
        const { data, error } = await supabase
            .from('document_comments')
            .update({
                content: updateData.content,
            })
            .eq('id', commentId)
            .select(`
                id,
                document_id,
                author_id,
                content,
                created_at,
                updated_at
            `)
            .single();

        if (error) {
            console.error('Error updating comment:', error);
            return { data: null, error };
        }

        // Create enriched comment for the updated comment
        const { data: userData } = await supabase.auth.getUser();

        const enrichedComment: DocumentComment = {
            ...data,
            author_name: 'You',
            author_email: userData.user?.email || '',
            is_own_comment: data.author_id === userData.user?.id,
        };

        return { data: enrichedComment, error: null };
    } catch (err) {
        console.error('Error in updateComment:', err);
        return { data: null, error: err as Error };
    }
};

// Delete a comment
export const deleteComment = async (commentId: string): Promise<{ error: Error | null }> => {
    try {
        const { error } = await supabase
            .from('document_comments')
            .delete()
            .eq('id', commentId);

        if (error) {
            console.error('Error deleting comment:', error);
            return { error };
        }

        return { error: null };
    } catch (err) {
        console.error('Error in deleteComment:', err);
        return { error: err as Error };
    }
};

// Get comment count for a document
export const getCommentCount = async (documentId: string): Promise<{ count: number; error: Error | null }> => {
    try {
        const { count, error } = await supabase
            .from('document_comments')
            .select('*', { count: 'exact', head: true })
            .eq('document_id', documentId);

        if (error) {
            console.error('Error getting comment count:', error);
            return { count: 0, error };
        }

        return { count: count || 0, error: null };
    } catch (err) {
        console.error('Error in getCommentCount:', err);
        return { count: 0, error: err as Error };
    }
}; 