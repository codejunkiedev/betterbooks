import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppSelector } from '@/shared/hooks/useRedux';
import { MODULES, ModuleName } from '@/shared/constants/modules';
import { getMyModules, getAccountingTierFromSettings, type UserModule } from '@/shared/services/supabase/modules';

export function useModules() {
    const { isAuthenticated } = useAppSelector((s) => s.user);
    const [modules, setModules] = useState<UserModule[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getMyModules();
            setModules(data);
        } catch (e) {
            setModules([]);
            setError(e instanceof Error ? e.message : 'Failed to load modules');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            void refresh();
        } else {
            setModules([]);
            setLoading(false);
        }
    }, [isAuthenticated, refresh]);

    const moduleMap = useMemo(() => {
        const map = new Map<ModuleName, UserModule>();
        modules.forEach((m) => map.set(m.name as ModuleName, m));
        return map;
    }, [modules]);

    const isModuleEnabled = useCallback(
        (name: ModuleName) => !!moduleMap.get(name)?.enabled,
        [moduleMap]
    );

    const accountingTier = useMemo(() => {
        const m = moduleMap.get(MODULES.ACCOUNTING);
        if (!m || !m.enabled) return null;
        return getAccountingTierFromSettings(m.settings);
    }, [moduleMap]);

    return {
        modules,
        loading,
        error,
        isModuleEnabled,
        accountingTier,
        hasAccounting: isModuleEnabled(MODULES.ACCOUNTING),
    } as const;
} 