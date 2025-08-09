import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Badge } from '@/shared/components/Badge';
import { ArrowLeft, User, Phone, Calendar, IdCard, Briefcase, Users } from 'lucide-react';
import { supabase } from '@/shared/services/supabase/client';
import type { Accountant } from '@/shared/types/accountant';

interface AccountantDetail extends Accountant {
    assigned_clients_count: number;
}

export function AccountantDetailView() {
    const navigate = useNavigate();
    const { accountantId } = useParams<{ accountantId: string }>();
    const [loading, setLoading] = useState(true);
    const [accountant, setAccountant] = useState<AccountantDetail | null>(null);

    useEffect(() => {
        const fetchAccountant = async () => {
            if (!accountantId) return;
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('accountants')
                    .select('*')
                    .eq('id', accountantId)
                    .maybeSingle();

                if (error) throw error;

                let assignedClientsCount = 0;
                const { count } = await supabase
                    .from('companies')
                    .select('id', { count: 'exact', head: true })
                    .eq('assigned_accountant_id', accountantId);

                assignedClientsCount = count || 0;

                setAccountant(data ? { ...(data as Accountant), assigned_clients_count: assignedClientsCount } : null);
            } catch (e) {
                // noop for now
            } finally {
                setLoading(false);
            }
        };

        fetchAccountant();
    }, [accountantId]);

    if (loading) {
        return (
            <div className="space-y-6 max-w-5xl mx-auto p-6 animate-pulse">
                <div className="flex items-center justify-between">
                    <div className="h-8 w-64 bg-gray-200 rounded" />
                    <div className="h-10 w-28 bg-gray-200 rounded" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-48 bg-gray-200 rounded" />
                    <div className="h-48 bg-gray-200 rounded" />
                </div>
            </div>
        );
    }

    if (!accountant) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Accountant Not Found</h2>
                <p className="text-gray-600 mb-4">The requested accountant could not be found.</p>
                <Button onClick={() => navigate('/admin/accountants')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Accountants
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <User className="w-6 h-6 text-gray-700" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{accountant.full_name}</h1>
                        <p className="text-gray-600">Complete accountant profile and stats</p>
                    </div>
                </div>
                <Button variant="outline" onClick={() => navigate('/admin/accountants')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <IdCard className="w-5 h-5" />
                                Profile Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                                    <p className="text-gray-900">{accountant.full_name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Accountant Code</label>
                                    <p className="text-gray-900">{accountant.accountant_code ?? 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Phone Number</label>
                                    <p className="text-gray-900 flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-500" /> {accountant.phone_number ?? 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Employment Type</label>
                                    <p className="text-gray-900 flex items-center gap-2">
                                        <Briefcase className="w-4 h-4 text-gray-500" /> {accountant.employment_type ?? 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Max Client Capacity</label>
                                    <p className="text-gray-900">{accountant.max_client_capacity ?? 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Start Date</label>
                                    <p className="text-gray-900 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-500" /> {accountant.start_date ? new Date(accountant.start_date).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-gray-700">Professional Qualifications</label>
                                    <p className="text-gray-900">{accountant.professional_qualifications ?? 'N/A'}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-gray-700">Specializations</label>
                                    <div className="flex flex-wrap gap-2">
                                        {(accountant.specialization ?? []).length > 0 ? (
                                            (accountant.specialization as string[]).map((s) => (
                                                <Badge key={s} variant="outline">{s}</Badge>
                                            ))
                                        ) : (
                                            <p className="text-gray-900">N/A</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Assignment & Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Assigned Clients</label>
                                <p className="text-gray-900">{accountant.assigned_clients_count}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Status</label>
                                <div className="mt-1">
                                    <span className={`px-2 py-1 rounded text-xs ${accountant.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                        {accountant.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
} 