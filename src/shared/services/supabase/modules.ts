export type UserModule = {
    name: string;
    enabled: boolean;
    settings: Record<string, unknown>;
};

import { supabase } from '@/shared/services/supabase/client';
import { ModuleName } from '@/shared/constants/modules';

export async function getMyModules(): Promise<UserModule[]> {
    const { data, error } = await supabase
        .from('user_modules')
        .select('module, enabled, settings');

    if (error) throw error;

    return (data || []).map((row: { module: ModuleName; enabled: boolean; settings: Record<string, unknown> | null }) => ({
        name: row.module,
        enabled: !!row.enabled,
        settings: row.settings ?? {},
    }));
}

export function getAccountingTierFromSettings(settings: Record<string, unknown> | undefined): 'Basic' | 'Advanced' | null {
    if (!settings) return null;
    const tier = (settings as { tier?: unknown }).tier;
    return tier === 'Basic' || tier === 'Advanced' ? tier : null;
}

export function findModule(modules: UserModule[], name: ModuleName): UserModule | undefined {
    return modules.find((m) => m.name === name);
} 