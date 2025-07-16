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

export interface CommentStats {
    total_comments: number;
    last_comment_at?: string;
} 