export interface Message {
    id: string;
    company_id: string;
    sender_id: string;
    recipient_id: string;
    related_document_id?: string;
    content: string;
    is_read: boolean;
    created_at: string;
    updated_at: string;
    // Expanded fields for UI display
    sender_name?: string;
    sender_email?: string;
    recipient_name?: string;
    recipient_email?: string;
    is_own_message?: boolean;
    document_name?: string;
}

export interface CreateMessageData {
    company_id: string;
    recipient_id: string;
    related_document_id?: string;
    content: string;
}

export interface UpdateMessageData {
    content?: string;
    is_read?: boolean;
}

export interface MessageListResponse {
    data: Message[] | null;
    error: Error | null;
}

export interface MessageResponse {
    data: Message | null;
    error: Error | null;
}

export interface MessageStats {
    total_messages: number;
    unread_count: number;
    last_message_at?: string;
}

// For document-specific messages (comments)
export interface DocumentMessage extends Message {
    related_document_id: string; // This will always be present for document messages
}

export interface CreateDocumentMessageData {
    document_id: string;
    content: string;
}

// Legacy types for backward compatibility during migration
export interface DocumentComment {
    id: string;
    document_id: string;
    author_id: string;
    content: string;
    created_at: string;
    updated_at: string;
    // Expanded fields for UI display
    author_name?: string;
    author_email?: string;
    is_own_comment?: boolean;
}

export interface CreateCommentData {
    document_id: string;
    content: string;
}

export interface UpdateCommentData {
    content: string;
}

export interface CommentListResponse {
    data: DocumentComment[] | null;
    error: Error | null;
}

export interface CommentResponse {
    data: DocumentComment | null;
    error: Error | null;
} 