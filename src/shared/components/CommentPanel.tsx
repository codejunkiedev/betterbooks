import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Send, Edit2, Trash2, Clock } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Textarea } from '@/shared/components/Textarea';
import { Avatar, AvatarFallback } from '@/shared/components/Avatar';
import { useToast } from '@/shared/hooks/useToast';
import {
    DocumentComment,
    CreateCommentData,
    UpdateCommentData
} from '@/shared/types/comment';
import {
    getCommentsByDocumentId,
    createComment,
    updateComment,
    deleteComment
} from '@/shared/services/supabase/comment';

interface CommentPanelProps {
    isOpen: boolean;
    onClose: () => void;
    documentId: string;
    documentName: string;
}

export const CommentPanel: React.FC<CommentPanelProps> = ({
    isOpen,
    onClose,
    documentId,
    documentName,
}) => {
    const [comments, setComments] = useState<DocumentComment[]>([]);
    const [loading, setLoading] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [editingComment, setEditingComment] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { toast } = useToast();

    // Load comments when panel opens
    useEffect(() => {
        if (isOpen && documentId) {
            loadComments();
        }
    }, [isOpen, documentId]);

    const loadComments = async () => {
        setLoading(true);
        try {
            const { data, error } = await getCommentsByDocumentId(documentId);

            if (error) {
                throw error;
            }

            setComments(data || []);
        } catch (error) {
            console.error('Error loading comments:', error);
            toast({
                title: 'Error',
                description: 'Failed to load comments',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            const commentData: CreateCommentData = {
                document_id: documentId,
                content: newComment.trim(),
            };

            const { data, error } = await createComment(commentData);

            if (error) {
                throw error;
            }

            if (data) {
                setComments(prev => [...prev, data]);
                setNewComment('');
                toast({
                    title: 'Comment added',
                    description: 'Your comment has been posted successfully',
                });
            }
        } catch (error) {
            console.error('Error adding comment:', error);
            toast({
                title: 'Error',
                description: 'Failed to add comment',
                variant: 'destructive',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditComment = async (commentId: string) => {
        if (!editContent.trim()) return;

        setSubmitting(true);
        try {
            const updateData: UpdateCommentData = {
                content: editContent.trim(),
            };

            const { data, error } = await updateComment(commentId, updateData);

            if (error) {
                throw error;
            }

            if (data) {
                setComments(prev => prev.map(comment =>
                    comment.id === commentId ? data : comment
                ));
                setEditingComment(null);
                setEditContent('');
                toast({
                    title: 'Comment updated',
                    description: 'Your comment has been updated successfully',
                });
            }
        } catch (error) {
            console.error('Error updating comment:', error);
            toast({
                title: 'Error',
                description: 'Failed to update comment',
                variant: 'destructive',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;

        try {
            const { error } = await deleteComment(commentId);

            if (error) {
                throw error;
            }

            setComments(prev => prev.filter(comment => comment.id !== commentId));
            toast({
                title: 'Comment deleted',
                description: 'Comment has been deleted successfully',
            });
        } catch (error) {
            console.error('Error deleting comment:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete comment',
                variant: 'destructive',
            });
        }
    };

    const startEdit = (comment: DocumentComment) => {
        setEditingComment(comment.id);
        setEditContent(comment.content);
    };

    const cancelEdit = () => {
        setEditingComment(null);
        setEditContent('');
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const getInitials = (name: string) => {
        if (!name || name.trim() === '') return 'U';
        return name
            .split(' ')
            .map(part => part[0] || '')
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'U';
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                        <div>
                            <h3 className="font-semibold text-gray-900">Comments</h3>
                            <p className="text-sm text-gray-600 truncate">{documentName}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                {/* Comments List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-gray-500">Loading comments...</div>
                        </div>
                    ) : comments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                            <MessageSquare className="w-12 h-12 mb-2" />
                            <p>No comments yet</p>
                            <p className="text-sm">Be the first to add a comment</p>
                        </div>
                    ) : (
                        comments.map((comment) => (
                            <div key={comment.id} className="border rounded-lg p-3 space-y-2">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="w-8 h-8">
                                            <AvatarFallback className="text-xs">
                                                {getInitials(comment.author_name || 'U')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-sm text-gray-900">
                                                {comment.author_name || 'Unknown User'}
                                            </p>
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <Clock className="w-3 h-3" />
                                                {formatDateTime(comment.created_at)}
                                                {comment.updated_at !== comment.created_at && (
                                                    <span className="ml-1">(edited)</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {comment.is_own_comment && (
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => startEdit(comment)}
                                                className="h-6 w-6 p-0"
                                            >
                                                <Edit2 className="w-3 h-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteComment(comment.id)}
                                                className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {editingComment === comment.id ? (
                                    <div className="space-y-2">
                                        <Textarea
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            placeholder="Edit your comment..."
                                            className="min-h-[60px] text-sm"
                                        />
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => handleEditComment(comment.id)}
                                                disabled={submitting || !editContent.trim()}
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={cancelEdit}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                        {comment.content}
                                    </p>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Add Comment Form */}
                <div className="border-t p-4 space-y-3">
                    <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="min-h-[80px] resize-none"
                        maxLength={2000}
                    />
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                            {newComment.length}/2000
                        </span>
                        <Button
                            onClick={handleAddComment}
                            disabled={submitting || !newComment.trim()}
                            size="sm"
                        >
                            <Send className="w-4 h-4 mr-2" />
                            Post Comment
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}; 