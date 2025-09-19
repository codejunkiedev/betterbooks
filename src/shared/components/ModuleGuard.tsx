import React from 'react';
import { Navigate } from 'react-router-dom';
import { MODULES, type ModuleName } from '@/shared/constants/modules';
import { useModules } from '@/shared/hooks/useModules';

interface ModuleGuardProps {
    module: ModuleName;
    requiredTier?: 'Basic' | 'Advanced';
    children: React.ReactNode;
}

export default function ModuleGuard({ module, requiredTier, children }: ModuleGuardProps) {
    const { loading, isModuleEnabled, accountingTier } = useModules();

    if (loading) return null;

    if (!isModuleEnabled(module)) {
        return <Navigate to="/unauthorized" replace />;
    }

    if (module === MODULES.ACCOUNTING && requiredTier) {
        if (!accountingTier) return <Navigate to="/unauthorized" replace />;
        if (requiredTier === 'Advanced' && accountingTier !== 'Advanced') {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    return <>{children}</>;
} 