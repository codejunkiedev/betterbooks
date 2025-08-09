import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/shared/services/supabase/client';
import { useToast } from '@/shared/hooks/useToast';
import type { Accountant } from './types';

export function useAccountants() {
    const { toast } = useToast();
    const [accountants, setAccountants] = useState<Accountant[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAccountants = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('accountants')
                .select('*')
                .order('full_name', { ascending: true });
            if (error) throw error;
            setAccountants((data || []) as Accountant[]);
        } catch (err) {
            const message = (err as Error).message ?? 'Failed to load accountants';
            toast({ title: 'Error', description: message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchAccountants();
    }, [fetchAccountants]);

    return { accountants, loading, reload: fetchAccountants };
} 