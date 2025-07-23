export interface CommentNotificationData {
    company_id: string;
    sender_id: string;
    recipient_id: string;
    related_document_id: string;
    content: string;
    is_read: boolean;
}