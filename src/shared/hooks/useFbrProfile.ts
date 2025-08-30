import { useState } from 'react';
import { getFbrProfileForSellerData } from '@/shared/services/supabase/fbr';
import { useToast } from './useToast';

interface SellerData {
    sellerNTNCNIC: string;
    sellerBusinessName: string;
    sellerProvince: string;
    sellerAddress: string;
}

interface UseFbrProfileReturn {
    sellerData: SellerData | null;
    loading: boolean;
    error: string | null;
    populateSellerData: (userId: string) => Promise<boolean>;
    clearSellerData: () => void;
}

export function useFbrProfile(): UseFbrProfileReturn {
    const [sellerData, setSellerData] = useState<SellerData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const populateSellerData = async (userId: string): Promise<boolean> => {
        setLoading(true);
        setError(null);
        
        try {
            const data = await getFbrProfileForSellerData(userId);
            
            if (!data) {
                setError('No FBR profile found');
                toast({
                    title: "No FBR Profile Found",
                    description: "Please complete your FBR profile setup first.",
                    variant: "destructive"
                });
                return false;
            }

            setSellerData(data);
            toast({
                title: "Seller Data Populated",
                description: "Seller information has been populated from your FBR profile.",
            });
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load FBR profile data';
            setError(errorMessage);
            toast({
                title: "Error",
                description: "Failed to load FBR profile data. Please try again.",
                variant: "destructive"
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    const clearSellerData = () => {
        setSellerData(null);
        setError(null);
    };

    return {
        sellerData,
        loading,
        error,
        populateSellerData,
        clearSellerData
    };
} 