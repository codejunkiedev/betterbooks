import { useState } from "react";
import { Button } from "@/shared/components/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/Dialog";
import { Textarea } from "@/shared/components/Textarea";
import { Label } from "@/shared/components/Label";
import { Document } from "@/shared/types/document";
import { createDocumentMessage } from "@/shared/services/supabase/message";
import { updateDocumentStatus } from "@/shared/services/supabase/document";
import { useToast } from "@/shared/hooks/useToast";
import { Loader2, Send } from "lucide-react";

interface AskUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    document: Document;
}

export const AskUserModal = ({ isOpen, onClose, document }: AskUserModalProps) => {
    const [question, setQuestion] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!question.trim()) {
            toast({
                title: "Error",
                description: "Please enter a question",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            // Create the message with the question
            const messageResult = await createDocumentMessage({
                document_id: document.id,
                content: question,
            });

            if (messageResult.error) {
                throw messageResult.error;
            }

            // Update document status to USER_INPUT_NEEDED
            const statusResult = await updateDocumentStatus({
                document_id: document.id,
                status: 'USER_INPUT_NEEDED',
            });

            if (statusResult.error) {
                throw statusResult.error;
            }

            toast({
                title: "Success",
                description: "Question sent to user and document marked for input needed",
            });

            // Reset form and close modal
            setQuestion("");
            onClose();
        } catch (error) {
            console.error("Error asking user question:", error);
            toast({
                title: "Error",
                description: "Failed to send question. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setQuestion("");
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Ask User Question
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="document-name">Document</Label>
                        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                            {document.original_filename}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="question">Your Question</Label>
                        <Textarea
                            id="question"
                            placeholder="Ask the user a specific question about this document..."
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            rows={4}
                            disabled={isSubmitting}
                            className="resize-none"
                        />
                        <p className="text-xs text-gray-500">
                            This question will be sent to the document owner and the document will be marked as needing user input.
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !question.trim()}
                            className="min-w-[100px]"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Send Question
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}; 