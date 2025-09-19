import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/Dialog';
import { Button } from '@/shared/components/Button';
import { Alert, AlertDescription } from '@/shared/components/Alert';
import { Badge } from '@/shared/components/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/Card';

import {
    AlertCircle,
    RefreshCw,
    ExternalLink,
    Loader2,
    AlertTriangle
} from 'lucide-react';
import { InvoiceFormData } from '@/shared/types/invoice';
import { generateFBRInvoiceNumberForPreview } from '@/shared/services/supabase/invoice';
import { FBRErrorHandler } from '@/shared/utils/fbrErrorHandler';
import { ValidationResult } from '@/shared/types/fbrValidation';

export interface FBRSubmissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoiceData: InvoiceFormData;
    environment: 'sandbox' | 'production';
    userId: string;
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
    stage: 'confirming' | 'submitting' | 'success' | 'error' | 'timeout' | 'validation_failed';
    message: string;
    progress: number;
    attempt?: number | undefined;
    fbrReference?: string | undefined;
    error?: string | undefined;
    canRetry?: boolean | undefined;
    validationErrors?: ValidationResult[];
    fbrResponse?: Record<string, unknown>;
}

export const FBRSubmissionModal: React.FC<FBRSubmissionModalProps> = ({
    isOpen,
    onClose,
    invoiceData,
    environment,
    userId,
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
    const [generatedRefNo, setGeneratedRefNo] = useState<string>('');

    // Generate reference number when modal opens
    useEffect(() => {
        if (isOpen && !invoiceData.invoiceRefNo) {
            const generateRefNo = async () => {
                try {
                    const year = new Date(invoiceData.invoiceDate).getFullYear();
                    const month = new Date(invoiceData.invoiceDate).getMonth() + 1;
                    const refNo = await generateFBRInvoiceNumberForPreview(userId, year, month);
                    setGeneratedRefNo(refNo);
                } catch (error) {
                    console.warn('Failed to generate reference number for preview:', error);
                    setGeneratedRefNo('Auto-generated');
                }
            };
            generateRefNo();
        } else if (invoiceData.invoiceRefNo) {
            setGeneratedRefNo(invoiceData.invoiceRefNo);
        }
    }, [isOpen, invoiceData.invoiceRefNo, invoiceData.invoiceDate, userId]);

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
                // Check if this is a validation error from FBR
                if (result.data?.response) {
                    const fbrResponse = result.data.response as Record<string, unknown>;
                    const validationErrors = FBRErrorHandler.processFBRResponse(fbrResponse);

                    if (validationErrors.length > 0) {
                        // This is a validation failure from FBR
                        setStatus({
                            stage: 'validation_failed',
                            message: '',
                            progress: 0,
                            attempt: result.attempt || undefined,
                            validationErrors,
                            fbrResponse,
                            canRetry: (result.attempt || 0) < maxRetries
                        });
                        return;
                    }
                }

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



    const renderValidationErrors = () => {
        if (!status.validationErrors || status.validationErrors.length === 0) {
            return null;
        }

        const prioritizedErrors = FBRErrorHandler.getPrioritizedErrors(status.validationErrors, 10);

        return (
            <div className="space-y-4">
                {/* Simple Error Display */}
                <Card className="bg-orange-50 border-orange-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2 text-orange-800">
                            <AlertTriangle className="h-5 w-5" />
                            Validation Errors
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {prioritizedErrors.map((error, index) => (
                                <Alert key={index} className="bg-red-50 border-red-200">
                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                    <AlertDescription className="text-red-800">
                                        <div className="font-medium mb-1">
                                            {error.code && (
                                                <Badge variant="outline" className="mr-2">
                                                    Error {error.code}
                                                </Badge>
                                            )}
                                            {FBRErrorHandler.formatErrorMessage(error)}
                                        </div>
                                        {error.suggestion && (
                                            <div className="text-sm text-red-700 mt-1">
                                                <strong>How to fix:</strong> {error.suggestion}
                                            </div>
                                        )}
                                        {error.field && error.field !== 'general' && (
                                            <div className="text-xs text-red-600 mt-1">
                                                <strong>Field:</strong> {error.field}
                                            </div>
                                        )}
                                    </AlertDescription>
                                </Alert>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        FBR Invoice Submission
                        <Badge variant={environment === 'production' ? 'destructive' : 'secondary'}>
                            {environment === 'production' ? 'Production' : 'Sandbox'}
                        </Badge>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">

                    {/* Validation Errors */}
                    {status.stage === 'validation_failed' && renderValidationErrors()}

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
                                        <p className="text-muted-foreground">{generatedRefNo || invoiceData.invoiceRefNo || 'Generating...'}</p>
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

                    {(status.stage === 'error' || status.stage === 'timeout' || status.stage === 'validation_failed') && (
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
