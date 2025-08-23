import { useState, useEffect, useCallback } from "react";
import { Message } from "@/shared/types/message";
import { getUserMessages, markMessageAsRead } from "@/shared/services/supabase/message";
import { supabase } from "@/shared/services/supabase/client";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Badge } from "@/shared/components/Badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/Dialog";
import { Textarea } from "@/shared/components/Textarea";
import { Loader2, MessageCircle, Send, FileText, Clock } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/shared/hooks/useToast";
import { createDocumentMessage } from "@/shared/services/supabase/message";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { useNavigate } from "react-router-dom";

interface AccountantQuestionsProps {
  className?: string;
}

export function AccountantQuestions({ className }: AccountantQuestionsProps) {
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
        description: "Failed to load questions from your accountant.",
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
  const recentQuestions = messages.slice(0, 3); // Show only 3 most recent

  if (isLoading) {
    return (
      <Card className={className}>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Questions from Your Accountant</h3>
          </div>
          <div className="flex items-center justify-center h-24">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Questions from Your Accountant</h3>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount} new
                </Badge>
              )}
            </div>
          </div>

          {messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No questions from your accountant yet.</p>
              <p className="text-xs text-gray-400 mt-1">
                Your accountant will send you questions here when they need more information.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentQuestions.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    message.is_read 
                      ? "bg-gray-50 border-gray-200 hover:bg-gray-100" 
                      : "bg-blue-50 border-blue-200 hover:bg-blue-100"
                  }`}
                  onClick={() => handleMessageClick(message)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {message.document_name && (
                          <FileText className="h-4 w-4 text-gray-500" />
                        )}
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {message.document_name || "Document Question"}
                        </span>
                        {!message.is_read && (
                          <Badge variant="destructive" className="text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {message.content}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{format(new Date(message.created_at), "MMM d, yyyy 'at' h:mm a")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {messages.length > 3 && (
                <div className="text-center pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/messages")}
                  >
                    View all {messages.length} questions
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

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
    </>
  );
} 