import React, { useState } from 'react';
import { Card, Button, Alert, AlertDescription, Badge, Progress } from '@/shared/components';
import {
    CheckCircle,
    XCircle,
    AlertTriangle,
    Loader2,
    RefreshCw,
} from 'lucide-react';
import {
    InvoiceValidationResponse
} from '@/shared/services/api/invoiceValidation';

import { ValidationSeverity } from '@/shared/constants/fbr';

interface InvoiceValidationModalProps {
    isOpen: boolean;
    onClose: () => void;
    validationResult: InvoiceValidationResponse | null;
    isLoading: boolean;
    onValidate: () => void;
    onSubmit?: () => void;
}

const ValidationSummary: React.FC<{ summary: InvoiceValidationResponse['summary'] }> = ({ summary }) => {
    const total = summary.total;
    const errors = summary.errors;
    const warnings = summary.warnings;
    const successes = summary.successes;

    const errorPercentage = total > 0 ? (errors / total) * 100 : 0;
    const warningPercentage = total > 0 ? (warnings / total) * 100 : 0;
    const successPercentage = total > 0 ? (successes / total) * 100 : 0;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Validation Summary</h3>
                <div className="flex gap-2">
                    {errors > 0 && (
                        <Badge className="bg-red-100 text-red-800">
                            {errors} Error{errors !== 1 ? 's' : ''}
                        </Badge>
                    )}
                    {warnings > 0 && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                            {warnings} Warning{warnings !== 1 ? 's' : ''}
                        </Badge>
                    )}
                    {successes > 0 && (
                        <Badge className="bg-green-100 text-green-800">
                            {successes} Passed
                        </Badge>
                    )}
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                    <span>Errors</span>
                    <span className="font-medium">{errors}</span>
                </div>
                <Progress
                    value={errorPercentage}
                    className="h-2 [&>div]:bg-red-500"
                />

                <div className="flex items-center justify-between text-sm">
                    <span>Warnings</span>
                    <span className="font-medium">{warnings}</span>
                </div>
                <Progress
                    value={warningPercentage}
                    className="h-2 [&>div]:bg-yellow-500"
                />

                <div className="flex items-center justify-between text-sm">
                    <span>Passed</span>
                    <span className="font-medium">{successes}</span>
                </div>
                <Progress
                    value={successPercentage}
                    className="h-2 [&>div]:bg-green-500"
                />
            </div>
        </div>
    );
};

export const InvoiceValidationModal: React.FC<InvoiceValidationModalProps> = ({
    isOpen,
    onClose,
    validationResult,
    isLoading,
    onValidate,
    onSubmit,
}) => {
    const [activeTab, setActiveTab] = useState<'summary' | 'details'>('summary');

    if (!isOpen) return null;

    const hasErrors = validationResult?.summary.errors && validationResult.summary.errors > 0;
    const hasWarnings = validationResult?.summary.warnings && validationResult.summary.warnings > 0;

    const errorResults = validationResult?.results.filter(r => r.severity === ValidationSeverity.ERROR) || [];
    const warningResults = validationResult?.results.filter(r => r.severity === ValidationSeverity.WARNING) || [];
    const successResults = validationResult?.results.filter(r => r.severity === ValidationSeverity.SUCCESS) || [];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold">Invoice Validation</h2>
                            <p className="text-sm text-gray-600 mt-1">
                                Review validation results before submitting to FBR
                            </p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            ×
                        </Button>
                    </div>
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
                            <span className="text-lg">Validating invoice...</span>
                        </div>
                    ) : validationResult ? (
                        <div className="space-y-6">
                            {/* Validation Status Alert */}
                            {validationResult.isValid ? (
                                <Alert className="border-green-200 bg-green-50">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <AlertDescription className="text-green-800">
                                        <strong>Validation Successful!</strong> Your invoice is ready for submission to FBR.
                                    </AlertDescription>
                                </Alert>
                            ) : hasErrors ? (
                                <Alert className="border-red-200 bg-red-50">
                                    <XCircle className="w-4 h-4 text-red-600" />
                                    <AlertDescription className="text-red-800">
                                        <strong>Validation Failed!</strong> Please fix the errors before submitting.
                                    </AlertDescription>
                                </Alert>
                            ) : hasWarnings ? (
                                <Alert className="border-yellow-200 bg-yellow-50">
                                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                                    <AlertDescription className="text-yellow-800">
                                        <strong>Validation Complete with Warnings!</strong> You can submit, but consider addressing the warnings.
                                    </AlertDescription>
                                </Alert>
                            ) : null}

                            {/* Tab Navigation */}
                            <div className="flex border-b">
                                <button
                                    onClick={() => setActiveTab('summary')}
                                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'summary'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Summary
                                </button>
                                <button
                                    onClick={() => setActiveTab('details')}
                                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'details'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Details ({validationResult.results.length})
                                </button>
                            </div>

                            {/* Tab Content */}
                            {activeTab === 'summary' ? (
                                <ValidationSummary summary={validationResult.summary} />
                            ) : (
                                <div className="space-y-4">
                                    {/* Errors */}
                                    {errorResults.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                                                <XCircle className="w-4 h-4" />
                                                Errors ({errorResults.length})
                                            </h4>
                                            <div className="space-y-3">
                                                {errorResults.map((result, index) => (
                                                    <div key={`error-${index}`} className="border rounded-lg p-3 bg-red-50 border-red-200">
                                                        <div className="flex items-start gap-3">
                                                            <XCircle className="w-4 h-4 text-red-600 mt-0.5" />
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="font-medium text-sm">
                                                                        {result.field.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase())}
                                                                    </span>
                                                                    {result.code && (
                                                                        <Badge className="text-xs bg-red-100 text-red-800">
                                                                            {result.code}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <p className="text-sm text-red-800">{result.message}</p>
                                                                {result.suggestion && (
                                                                    <p className="text-xs text-red-600 mt-2">
                                                                        <strong>Suggestion:</strong> {result.suggestion}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Warnings */}
                                    {warningResults.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                                                <AlertTriangle className="w-4 h-4" />
                                                Warnings ({warningResults.length})
                                            </h4>
                                            <div className="space-y-3">
                                                {warningResults.map((result, index) => (
                                                    <div key={`warning-${index}`} className="border rounded-lg p-3 bg-yellow-50 border-yellow-200">
                                                        <div className="flex items-start gap-3">
                                                            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="font-medium text-sm">
                                                                        {result.field.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase())}
                                                                    </span>
                                                                    {result.code && (
                                                                        <Badge className="text-xs bg-yellow-100 text-yellow-800">
                                                                            {result.code}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <p className="text-sm text-yellow-800">{result.message}</p>
                                                                {result.suggestion && (
                                                                    <p className="text-xs text-yellow-600 mt-2">
                                                                        <strong>Suggestion:</strong> {result.suggestion}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Successes */}
                                    {successResults.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4" />
                                                Passed ({successResults.length})
                                            </h4>
                                            <div className="space-y-3">
                                                {successResults.map((result, index) => (
                                                    <div key={`success-${index}`} className="border rounded-lg p-3 bg-green-50 border-green-200">
                                                        <div className="flex items-start gap-3">
                                                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="font-medium text-sm">
                                                                        {result.field.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase())}
                                                                    </span>
                                                                    {result.code && (
                                                                        <Badge className="text-xs bg-green-100 text-green-800">
                                                                            {result.code}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <p className="text-sm text-green-800">{result.message}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t bg-gray-50">
                    <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={onClose}>
                                Close
                            </Button>
                            {!validationResult && (
                                <Button onClick={onValidate} disabled={isLoading}>
                                    {isLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    ) : (
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                    )}
                                    Validate Invoice
                                </Button>
                            )}
                        </div>

                        {validationResult && (
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={onValidate} disabled={isLoading}>
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Re-validate
                                </Button>
                                {validationResult.isValid && onSubmit && (
                                    <Button
                                        className="bg-green-600 hover:bg-green-700"
                                        onClick={onSubmit}
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Submit to FBR
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
};