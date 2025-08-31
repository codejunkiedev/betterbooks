import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './Dialog';
import { Button } from './Button';
import { Alert, AlertDescription } from './Alert';
import { Badge } from './Badge';
import { Progress } from './Progress';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import {
    AlertCircle,
    CheckCircle,
    XCircle,
    Clock,
    RefreshCw,
    FileText,
    ExternalLink,
    Loader2
} from 'lucide-react';
import { InvoiceFormData } from '@/shared/types/invoice';

export interface FBRSubmissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoiceData: InvoiceFormData;
    environment: 'sandbox' | 'production';
    onSubmit: () => Promise<{
        success: boolean;
        data?: {
            fbrReference?: string;
            transactionId?: string;
            response?: Record<string, unknown>;
        };
        error?: string;
        attempt?: number;
    }>;
    onRetry?: () => void;
    maxRetries?: number;
}

export interface SubmissionStatus {
    stage: 'confirming' | 'submitting' | 'success' | 'error' | 'timeout';
    message: string;
    progress: number;
    attempt?: number | undefined;
    fbrReference?: string | undefined;
    error?: string | undefined;
    canRetry?: boolean | undefined;
}

export const FBRSubmissionModal: React.FC<FBRSubmissionModalProps> = ({
    isOpen,
    onClose,
    invoiceData,
    environment,
    onSubmit,
    onRetry,
    maxRetries = 3
}) => {
    const [status, setStatus] = useState<SubmissionStatus>({
        stage: 'confirming',
        message: 'Review submission details',
        progress: 0
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setStatus({
            stage: 'submitting',
            message: 'Connecting to FBR...',
            progress: 10
        });

        try {
            // Simulate progress updates
            const progressInterval = setInterval(() => {
                setStatus(prev => ({
                    ...prev,
                    progress: Math.min(prev.progress + 15, 90)
                }));
            }, 1000);

            const result = await onSubmit();

            clearInterval(progressInterval);

            if (result.success) {
                setStatus({
                    stage: 'success',
                    message: 'Invoice submitted successfully to FBR',
                    progress: 100,
                    fbrReference: result.data?.fbrReference || result.data?.transactionId || undefined
                });
            } else {
                const isTimeout = result.error?.includes('timeout') || result.error?.includes('Timeout');
                const canRetry = (result.attempt || 0) < maxRetries;

                setStatus({
                    stage: isTimeout ? 'timeout' : 'error',
                    message: result.error || 'Submission failed',
                    progress: 0,
                    attempt: result.attempt || undefined,
                    error: result.error || undefined,
                    canRetry
                });
            }
        } catch (error) {
            setStatus({
                stage: 'error',
                message: error instanceof Error ? error.message : 'An unexpected error occurred',
                progress: 0,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRetry = () => {
        if (onRetry) {
            onRetry();
        } else {
            handleSubmit();
        }
    };

    const handleClose = () => {
        if (status.stage === 'submitting') {
            return; // Don't allow closing during submission
        }
        onClose();
        // Reset status when closing
        setTimeout(() => {
            setStatus({
                stage: 'confirming',
                message: 'Review submission details',
                progress: 0
            });
        }, 300);
    };

    const getStageIcon = () => {
        switch (status.stage) {
            case 'confirming':
                return <FileText className="h-5 w-5 text-blue-500" />;
            case 'submitting':
                return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
            case 'success':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'error':
                return <XCircle className="h-5 w-5 text-red-500" />;
            case 'timeout':
                return <Clock className="h-5 w-5 text-orange-500" />;
            default:
                return <FileText className="h-5 w-5 text-blue-500" />;
        }
    };

    const getStageColor = () => {
        switch (status.stage) {
            case 'confirming':
                return 'bg-blue-50 border-blue-200';
            case 'submitting':
                return 'bg-blue-50 border-blue-200';
            case 'success':
                return 'bg-green-50 border-green-200';
            case 'error':
                return 'bg-red-50 border-red-200';
            case 'timeout':
                return 'bg-orange-50 border-orange-200';
            default:
                return 'bg-blue-50 border-blue-200';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {getStageIcon()}
                        FBR Invoice Submission
                        <Badge variant={environment === 'production' ? 'destructive' : 'secondary'}>
                            {environment === 'production' ? 'Production' : 'Sandbox'}
                        </Badge>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Status Card */}
                    <Card className={getStageColor()}>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                {status.stage === 'confirming' && 'Review Submission'}
                                {status.stage === 'submitting' && 'Submitting to FBR'}
                                {status.stage === 'success' && 'Submission Successful'}
                                {status.stage === 'error' && 'Submission Failed'}
                                {status.stage === 'timeout' && 'Submission Timeout'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                {status.message}
                            </p>

                            {status.stage === 'submitting' && (
                                <div className="space-y-3">
                                    <Progress value={status.progress} className="w-full" />
                                    <p className="text-xs text-muted-foreground">
                                        Progress: {status.progress}%
                                    </p>
                                </div>
                            )}

                            {status.stage === 'success' && status.fbrReference && (
                                <Alert className="bg-green-50 border-green-200">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <AlertDescription className="text-green-800">
                                        <strong>FBR Reference:</strong> {status.fbrReference}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {(status.stage === 'error' || status.stage === 'timeout') && (
                                <Alert className="bg-red-50 border-red-200">
                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                    <AlertDescription className="text-red-800">
                                        {status.error}
                                        {status.attempt && (
                                            <span className="block mt-1 text-sm">
                                                Attempt {status.attempt} of {maxRetries}
                                            </span>
                                        )}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    {/* Invoice Details */}
                    {status.stage === 'confirming' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Invoice Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium">Invoice Type:</span>
                                        <p className="text-muted-foreground">{invoiceData.invoiceType}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium">Invoice Date:</span>
                                        <p className="text-muted-foreground">{invoiceData.invoiceDate}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium">Reference No:</span>
                                        <p className="text-muted-foreground">{invoiceData.invoiceRefNo}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium">Total Amount:</span>
                                        <p className="text-muted-foreground">Rs. {invoiceData.totalAmount.toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">Seller:</span>
                                        <span className="text-muted-foreground">{invoiceData.sellerBusinessName}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">Buyer:</span>
                                        <span className="text-muted-foreground">{invoiceData.buyerBusinessName}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t">
                                    <div className="flex items-center gap-2 text-sm">
                                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">
                                            This will submit to FBR {environment === 'production' ? 'Production' : 'Sandbox'} environment
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Troubleshooting for errors */}
                    {(status.stage === 'error' || status.stage === 'timeout') && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Troubleshooting</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                {status.stage === 'timeout' && (
                                    <div className="space-y-2">
                                        <p className="text-muted-foreground">
                                            The FBR server took too long to respond. This could be due to:
                                        </p>
                                        <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                                            <li>High server load at FBR</li>
                                            <li>Network connectivity issues</li>
                                            <li>Large invoice data</li>
                                        </ul>
                                    </div>
                                )}

                                {status.stage === 'error' && (
                                    <div className="space-y-2">
                                        <p className="text-muted-foreground">
                                            The submission failed. Common causes:
                                        </p>
                                        <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                                            <li>Invalid invoice data format</li>
                                            <li>FBR API authentication issues</li>
                                            <li>Server-side validation errors</li>
                                        </ul>
                                    </div>
                                )}

                                {status.canRetry && (
                                    <div className="pt-3 border-t">
                                        <p className="text-muted-foreground">
                                            You can retry the submission. The system will attempt to resubmit automatically.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t">
                    {status.stage === 'confirming' && (
                        <>
                            <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button onClick={handleSubmit} disabled={isSubmitting}>
                                Confirm & Submit
                            </Button>
                        </>
                    )}

                    {status.stage === 'submitting' && (
                        <Button variant="outline" disabled>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Submitting...
                        </Button>
                    )}

                    {status.stage === 'success' && (
                        <Button onClick={handleClose}>
                            Done
                        </Button>
                    )}

                    {(status.stage === 'error' || status.stage === 'timeout') && (
                        <>
                            <Button variant="outline" onClick={handleClose}>
                                Close
                            </Button>
                            {status.canRetry && (
                                <Button onClick={handleRetry}>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Retry
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
