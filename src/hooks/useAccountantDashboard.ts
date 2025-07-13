import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface Client {
    id: string;
    name: string;
    type: string;
    is_active: boolean;
    pending_documents: number;
    total_documents: number;
    last_activity: string;
}

interface DashboardStats {
    total_clients: number;
    active_clients: number;
    pending_documents: number;
    completed_documents: number;
    total_revenue: number;
}

export const useAccountantDashboard = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();
    const { toast } = useToast();

    const loadDashboardData = useCallback(async () => {
        if (!user) return;

        try {
            setIsLoading(true);

            // Fetch assigned clients
            const { data: clientsData, error: clientsError } = await supabase
                .from('companies')
                .select(`
          id,
          name,
          type,
          is_active,
          created_at,
          documents!inner(id, status)
        `)
                .eq('assigned_accountant_id', user.id)
                .eq('is_active', true);

            if (clientsError) throw clientsError;

            // Process clients data
            const processedClients = clientsData?.map(client => {
                const pendingDocs = client.documents?.filter((doc: { status: string }) =>
                    doc.status === 'PENDING_REVIEW' || doc.status === 'IN_PROGRESS'
                ).length || 0;

                const totalDocs = client.documents?.length || 0;

                return {
                    id: client.id,
                    name: client.name,
                    type: client.type,
                    is_active: client.is_active,
                    pending_documents: pendingDocs,
                    total_documents: totalDocs,
                    last_activity: client.created_at
                };
            }) || [];

            setClients(processedClients);

            // Calculate dashboard stats
            const totalClients = processedClients.length;
            const activeClients = processedClients.filter(c => c.is_active).length;
            const pendingDocuments = processedClients.reduce((sum, client) => sum + client.pending_documents, 0);
            const completedDocuments = processedClients.reduce((sum, client) =>
                sum + (client.total_documents - client.pending_documents), 0);

            setStats({
                total_clients: totalClients,
                active_clients: activeClients,
                pending_documents: pendingDocuments,
                completed_documents: completedDocuments,
                total_revenue: 0 // TODO: Calculate from billing
            });

        } catch (error) {
            console.error("Error loading accountant dashboard:", error);
            toast({
                title: "Error",
                description: "Failed to load dashboard data. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [user, toast]);

    const refreshData = useCallback(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    return {
        clients,
        stats,
        isLoading,
        refreshData
    };
}; 