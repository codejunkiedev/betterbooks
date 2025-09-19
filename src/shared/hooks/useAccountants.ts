import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/shared/services/supabase/client';
import { useToast } from '@/shared/hooks/useToast';
import type { Accountant } from '@/shared/types/accountant';

export function useAccountants(params: {
    search: string;
    status: 'all' | 'active' | 'inactive';
    page: number;
    itemsPerPage: number;
}) {
    const { search, status, page, itemsPerPage } = params;
    const { toast } = useToast();
    const [accountants, setAccountants] = useState<Accountant[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const fetchAccountants = useCallback(async () => {
        try {
            setLoading(true);
            const from = (page - 1) * itemsPerPage;
            const to = from + itemsPerPage - 1;

            let query = supabase
                .from('accountants')
                .select('*', { count: 'exact' })
                .order('full_name', { ascending: true });

            if (status !== 'all') {
                query = query.eq('is_active', status === 'active');
            }

            if (search) {
                const s = `%${search}%`;
                query = query.or(
                    `full_name.ilike.${s},accountant_code.ilike.${s},phone_number.ilike.${s}`
                );
            }

            const { data, error, count } = await query.range(from, to);

            if (error) throw error;

            setAccountants((data || []) as Accountant[]);
            const totalCount = count || 0;
            setTotal(totalCount);
            setTotalPages(Math.max(1, Math.ceil(totalCount / itemsPerPage)));
        } catch (err) {
            const message = (err as Error).message ?? 'Failed to load accountants';
            toast({ title: 'Error', description: message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [itemsPerPage, page, search, status, toast]);

    useEffect(() => {
        fetchAccountants();
    }, [fetchAccountants]);

    return { accountants, loading, total, totalPages, reload: fetchAccountants };
} 