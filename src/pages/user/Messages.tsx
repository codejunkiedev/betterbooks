import { useState, useEffect, useCallback } from "react";
import { Message } from "@/shared/types/message";
import { getUserMessages, markMessageAsRead } from "@/shared/services/supabase/message";
import { supabase } from "@/shared/services/supabase/client";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Badge } from "@/shared/components/Badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/Dialog";
import { Textarea } from "@/shared/components/Textarea";
import { Loader2, MessageCircle, Send, FileText, Clock, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/shared/hooks/useToast";
import { createDocumentMessage } from "@/shared/services/supabase/message";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { useNavigate } from "react-router-dom";

export default function Messages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { refreshUnreadCount } = useNotifications();
  const navigate = useNavigate();

  const loadMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await getUserMessages();
      if (error) throw error;
      
      // Filter for messages where current user is the recipient and has related document
      const { data: userData } = await supabase.auth.getUser();
      const currentUserId = userData.user?.id;
      
      const accountantQuestions = (data || []).filter(
        message => message.recipient_id === currentUserId && message.related_document_id
      );
      
      setMessages(accountantQuestions);
    } catch (error) {
      console.error("Error loading messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages from your accountant.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const handleMessageClick = async (message: Message) => {
    setSelectedMessage(message);
    setIsDialogOpen(true);
    
    // Mark message as read if it's unread
    if (!message.is_read) {
      try {
        await markMessageAsRead(message.id);
        // Update local state
        setMessages(prev => 
          prev.map(msg => 
            msg.id === message.id ? { ...msg, is_read: true } : msg
          )
        );
        // Refresh notification count
        refreshUnreadCount();
      } catch (error) {
        console.error("Error marking message as read:", error);
      }
    }
  };

  const handleReply = async () => {
    if (!selectedMessage || !replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await createDocumentMessage({
        document_id: selectedMessage.related_document_id!,
        content: replyContent,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your reply has been sent to your accountant.",
      });

      setReplyContent("");
      setIsDialogOpen(false);
      setSelectedMessage(null);
      
      // Reload messages to show the new reply
      await loadMessages();
    } catch (error) {
      console.error("Error sending reply:", error);
      toast({
        title: "Error",
        description: "Failed to send your reply. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const unreadCount = messages.filter(msg => !msg.is_read).length;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Messages from Your Accountant</h1>
              <p className="text-gray-500 text-lg">View and respond to questions about your documents</p>
            </div>
          </div>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-sm">
              {unreadCount} unread
            </Badge>
          )}
        </div>

        {/* Messages List */}
        {messages.length === 0 ? (
          <Card>
            <div className="text-center py-12 text-gray-500">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No messages yet</h3>
              <p className="text-sm">
                Your accountant will send you questions here when they need more information about your documents.
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <Card
                key={message.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  message.is_read 
                    ? "border-gray-200" 
                    : "border-blue-200 bg-blue-50"
                }`}
                onClick={() => handleMessageClick(message)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {message.document_name && (
                          <FileText className="h-4 w-4 text-gray-500" />
                        )}
                        <span className="text-sm font-medium text-gray-900">
                          {message.document_name || "Document Question"}
                        </span>
                        {!message.is_read && (
                          <Badge variant="destructive" className="text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                        {message.content}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{format(new Date(message.created_at), "MMM d, yyyy 'at' h:mm a")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Message Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Question from Your Accountant</DialogTitle>
          </DialogHeader>
          
          {selectedMessage && (
            <div className="space-y-4">
              {/* Question Context */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-900">
                    {selectedMessage.document_name || "Document"}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {selectedMessage.content}
                </p>
                <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>
                    {format(new Date(selectedMessage.created_at), "MMM d, yyyy 'at' h:mm a")}
                  </span>
                </div>
              </div>

              {/* Reply Section */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-900">
                  Your Reply
                </label>
                <Textarea
                  placeholder="Type your reply to your accountant..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      setSelectedMessage(null);
                      setReplyContent("");
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleReply}
                    disabled={!replyContent.trim() || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Reply
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 