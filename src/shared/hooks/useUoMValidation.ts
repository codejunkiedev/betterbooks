import { useState, useCallback } from 'react';
import { UoMValidationSeverity } from '@/shared/constants/uom';
import type { UoMValidationResult } from '@/shared/types/invoice';

interface UseUoMValidationReturn {
    validationResults: Map<string, UoMValidationResult>;
    hasCriticalErrors: boolean;
    hasWarnings: boolean;
    addValidationResult: (itemId: string, result: UoMValidationResult) => void;
    removeValidationResult: (itemId: string) => void;
    clearAllValidations: () => void;
    getValidationSummary: () => {
        totalItems: number;
        validItems: number;
        warningItems: number;
        errorItems: number;
        criticalErrors: number;
    };
}

export function useUoMValidation(): UseUoMValidationReturn {
    const [validationResults, setValidationResults] = useState<Map<string, UoMValidationResult>>(new Map());

    const addValidationResult = useCallback((itemId: string, result: UoMValidationResult) => {
        setValidationResults(prev => {
            const newMap = new Map(prev);
            newMap.set(itemId, result);
            return newMap;
        });
    }, []);

    const removeValidationResult = useCallback((itemId: string) => {
        setValidationResults(prev => {
            const newMap = new Map(prev);
            newMap.delete(itemId);
            return newMap;
        });
    }, []);

    const clearAllValidations = useCallback(() => {
        setValidationResults(new Map());
    }, []);

    const hasCriticalErrors = useCallback(() => {
        return Array.from(validationResults.values()).some(
            result => result.severity === UoMValidationSeverity.ERROR && result.isCriticalMismatch
        );
    }, [validationResults]);

    const hasWarnings = useCallback(() => {
        return Array.from(validationResults.values()).some(
            result => !result.isValid && result.severity === UoMValidationSeverity.WARNING
        );
    }, [validationResults]);

    const getValidationSummary = useCallback(() => {
        const results = Array.from(validationResults.values());
        const totalItems = results.length;
        const validItems = results.filter(r => r.isValid).length;
        const warningItems = results.filter(r => !r.isValid && r.severity === UoMValidationSeverity.WARNING).length;
        const errorItems = results.filter(r => !r.isValid && r.severity === UoMValidationSeverity.ERROR).length;
        const criticalErrors = results.filter(r => r.isCriticalMismatch).length;

        return {
            totalItems,
            validItems,
            warningItems,
            errorItems,
            criticalErrors
        };
    }, [validationResults]);

    return {
        validationResults,
        hasCriticalErrors: hasCriticalErrors(),
        hasWarnings: hasWarnings(),
        addValidationResult,
        removeValidationResult,
        clearAllValidations,
        getValidationSummary
    };
}
