import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components/Tooltip';
import { UoMValidationSeverity } from '@/shared/constants/uom';
import type { UoMValidationResult } from '@/shared/types/invoice';

interface UoMValidationFieldProps {
    hsCode: string;
    selectedUoM: string;
    onUoMChange: (newUoM: string) => void;
    onValidationResult?: (result: UoMValidationResult) => void;
    validateUoM: (hsCode: string, selectedUoM: string) => Promise<UoMValidationResult>;
    disabled?: boolean;
    className?: string;
}

export function UoMValidationField({
    hsCode,
    selectedUoM,
    onUoMChange,
    onValidationResult,
    validateUoM,
    disabled = false,
    className = ''
}: UoMValidationFieldProps) {
    const [validationResult, setValidationResult] = useState<UoMValidationResult | null>(null);
    const [isValidating, setIsValidating] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    // Validate UoM when HS code or selected UoM changes
    useEffect(() => {
        if (hsCode && selectedUoM) {
            validateUoMField();
        } else {
            setValidationResult(null);
        }
    }, [hsCode, selectedUoM]);

    const validateUoMField = async () => {
        if (!hsCode || !selectedUoM) return;

        setIsValidating(true);
        try {
            const result = await validateUoM(hsCode, selectedUoM);
            setValidationResult(result);
            onValidationResult?.(result);
        } catch (error) {
            console.error('UoM validation failed:', error);
        } finally {
            setIsValidating(false);
        }
    };

    const handleUseRecommended = () => {
        if (validationResult?.recommendedUoM) {
            onUoMChange(validationResult.recommendedUoM);
            setShowTooltip(false);
        }
    };

    const getValidationIcon = () => {
        if (isValidating) {
            return <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />;
        }

        if (!validationResult) return null;

        if (validationResult.isValid) {
            return <CheckCircle className="w-4 h-4 text-green-500" />;
        }

        if (validationResult.severity === UoMValidationSeverity.ERROR) {
            return <XCircle className="w-4 h-4 text-red-500" />;
        }

        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    };

    const getFieldClassName = () => {
        let baseClass = 'border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500';
        
        if (validationResult && !validationResult.isValid) {
            if (validationResult.severity === UoMValidationSeverity.ERROR) {
                baseClass += ' border-red-500 bg-red-50 focus:ring-red-500';
            } else {
                baseClass += ' border-amber-500 bg-amber-50 focus:ring-amber-500';
            }
        } else {
            baseClass += ' border-gray-300';
        }

        if (disabled) {
            baseClass += ' bg-gray-100 cursor-not-allowed';
        }

        return `${baseClass} ${className}`;
    };

    const getTooltipMessage = () => {
        if (!validationResult) return '';
        
        if (validationResult.isValid) {
            return 'UoM is valid for this HS Code';
        }

        if (validationResult.severity === UoMValidationSeverity.ERROR) {
            return validationResult.message || 'Critical mismatch - FBR will reject this invoice';
        }

        return validationResult.message || `Recommended UoM for this HS Code: ${validationResult.recommendedUoM}`;
    };

    return (
        <TooltipProvider>
            <div className="relative">
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={selectedUoM}
                            onChange={(e) => onUoMChange(e.target.value)}
                            className={getFieldClassName()}
                            disabled={disabled}
                            placeholder="Enter UoM"
                        />
                        {getValidationIcon() && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                {getValidationIcon()}
                            </div>
                        )}
                    </div>
                    
                    {validationResult && !validationResult.isValid && validationResult.recommendedUoM && (
                        <Tooltip open={showTooltip} onOpenChange={setShowTooltip}>
                            <TooltipTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleUseRecommended}
                                    disabled={disabled}
                                    className="whitespace-nowrap"
                                >
                                    Use Recommended
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{getTooltipMessage()}</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>

                {/* Validation message */}
                {validationResult && !validationResult.isValid && (
                    <div className={`mt-1 text-sm ${
                        validationResult.severity === UoMValidationSeverity.ERROR 
                            ? 'text-red-600' 
                            : 'text-amber-600'
                    }`}>
                        {getTooltipMessage()}
                    </div>
                )}
            </div>
        </TooltipProvider>
    );
}
