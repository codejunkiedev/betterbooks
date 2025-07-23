import React, { useState, useEffect, useCallback } from 'react';
import { X, MessageSquare, Send, Edit2, Trash2, Clock } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Textarea } from '@/shared/components/Textarea';
import { Avatar, AvatarFallback } from '@/shared/components/Avatar';
import { useToast } from '@/shared/hooks/useToast';
import {
    DocumentMessage,
    CreateDocumentMessageData,
    UpdateMessageData
} from '@/shared/types/message';
import {
    getDocumentMessages,
    createDocumentMessage,
    updateMessage,
    deleteMessage
} from '@/shared/services/supabase/message';

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
    const [messages, setMessages] = useState<DocumentMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [editingMessage, setEditingMessage] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { toast } = useToast();

    const loadMessages = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await getDocumentMessages(documentId);

            if (error) {
                throw error;
            }

            setMessages(data || []);
        } catch (error) {
            console.error('Error loading messages:', error);
            toast({
                title: 'Error',
                description: 'Failed to load messages',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }, [documentId, toast]);

    // Load messages when panel opens
    useEffect(() => {
        if (isOpen && documentId) {
            loadMessages();
        }
    }, [isOpen, documentId, loadMessages]);

    const handleAddMessage = async () => {
        if (!newMessage.trim()) return;

        setSubmitting(true);
        try {
            const messageData: CreateDocumentMessageData = {
                document_id: documentId,
                content: newMessage.trim(),
            };

            const { data, error } = await createDocumentMessage(messageData);

            if (error) {
                throw error;
            }

            if (data) {
                setMessages(prev => [...prev, data as DocumentMessage]);
                setNewMessage('');
                toast({
                    title: 'Message added',
                    description: 'Your message has been posted successfully',
                });
            }
        } catch (error) {
            console.error('Error adding message:', error);
            toast({
                title: 'Error',
                description: 'Failed to add message',
                variant: 'destructive',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditMessage = async (messageId: string) => {
        if (!editContent.trim()) return;

        setSubmitting(true);
        try {
            const updateData: UpdateMessageData = {
                content: editContent.trim(),
            };

            const { data, error } = await updateMessage(messageId, updateData);

            if (error) {
                throw error;
            }

            if (data) {
                setMessages(prev => prev.map(message =>
                    message.id === messageId ? data as DocumentMessage : message
                ));
                setEditingMessage(null);
                setEditContent('');
                toast({
                    title: 'Message updated',
                    description: 'Your message has been updated successfully',
                });
            }
        } catch (error) {
            console.error('Error updating message:', error);
            toast({
                title: 'Error',
                description: 'Failed to update message',
                variant: 'destructive',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteMessage = async (messageId: string) => {
        if (!confirm('Are you sure you want to delete this message?')) return;

        try {
            const { error } = await deleteMessage(messageId);

            if (error) {
                throw error;
            }

            setMessages(prev => prev.filter(message => message.id !== messageId));
            toast({
                title: 'Message deleted',
                description: 'Message has been deleted successfully',
            });
        } catch (error) {
            console.error('Error deleting message:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete message',
                variant: 'destructive',
            });
        }
    };

    const startEdit = (message: DocumentMessage) => {
        setEditingMessage(message.id);
        setEditContent(message.content);
    };

    const cancelEdit = () => {
        setEditingMessage(null);
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
                className="fixed inset-0 bg-black bg-opacity-50 z-[9999]"
                onClick={onClose}
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
            />

            {/* Panel */}
            <div className="fixed right-0 top-0 h-screen w-96 bg-white shadow-xl z-[10000] flex flex-col" style={{ position: 'fixed', top: 0, right: 0, height: '100vh', width: '24rem' }}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b bg-gray-50 flex-shrink-0">
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

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-gray-500">Loading messages...</div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                            <MessageSquare className="w-12 h-12 mb-2" />
                            <p>No messages yet</p>
                            <p className="text-sm">Be the first to add a message</p>
                        </div>
                    ) : (
                        messages.map((message) => (
                            <div key={message.id} className="border rounded-lg p-3 space-y-2">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="w-8 h-8">
                                            <AvatarFallback className="text-xs">
                                                {getInitials(message.sender_name || 'U')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-sm text-gray-900">
                                                {message.sender_name || 'R'}
                                            </p>
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <Clock className="w-3 h-3" />
                                                {formatDateTime(message.created_at)}
                                                {message.updated_at !== message.created_at && (
                                                    <span className="ml-1">(edited)</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {message.is_own_message && (
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => startEdit(message)}
                                                className="h-6 w-6 p-0"
                                            >
                                                <Edit2 className="w-3 h-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteMessage(message.id)}
                                                className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {editingMessage === message.id ? (
                                    <div className="space-y-2">
                                        <Textarea
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            placeholder="Edit your message..."
                                            className="min-h-[60px] text-sm"
                                        />
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => handleEditMessage(message.id)}
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
                                        {message.content}
                                    </p>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Add Message Form */}
                <div className="border-t p-4 space-y-3 flex-shrink-0">
                    <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Add a message..."
                        className="min-h-[80px] resize-none"
                        maxLength={2000}
                    />
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                            {newMessage.length}/2000
                        </span>
                        <Button
                            onClick={handleAddMessage}
                            disabled={submitting || !newMessage.trim()}
                            size="sm"
                        >
                            <Send className="w-4 h-4 mr-2" />
                            Post Message
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}; 