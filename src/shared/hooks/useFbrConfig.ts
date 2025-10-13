import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/shared/services/store';
import { getFbrConfigStatus } from '@/shared/services/supabase/fbr';
import { FBR_API_STATUS } from '@/shared/constants/fbr';

interface UseFbrConfigReturn {
    productionStatus: FBR_API_STATUS;
    sandboxStatus: FBR_API_STATUS;
    loading: boolean;
    error: string | null;
    isProductionConnected: boolean;
    isSandboxConnected: boolean;
}

export function useFbrConfig(): UseFbrConfigReturn {
    const { user } = useSelector((state: RootState) => state.user);
    const [productionStatus, setProductionStatus] = useState<FBR_API_STATUS>(FBR_API_STATUS.NOT_CONFIGURED);
    const [sandboxStatus, setSandboxStatus] = useState<FBR_API_STATUS>(FBR_API_STATUS.NOT_CONFIGURED);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchConfigStatus = async () => {
            if (!user?.id) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const config = await getFbrConfigStatus(user.id);
                setProductionStatus(config.production_status as FBR_API_STATUS);
                setSandboxStatus(config.sandbox_status as FBR_API_STATUS);
                setError(null);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to load FBR config status';
                setError(errorMessage);
                console.error('Error fetching FBR config status:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchConfigStatus();
    }, [user?.id]);

    return {
        productionStatus,
        sandboxStatus,
        loading,
        error,
        isProductionConnected: productionStatus === FBR_API_STATUS.CONNECTED,
        isSandboxConnected: sandboxStatus === FBR_API_STATUS.CONNECTED,
    };
}