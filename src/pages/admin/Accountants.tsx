import { useState } from 'react';
import { Card, CardContent } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { AddAccountantModal, AccountantsTable, AccountantsFiltersModal, AccountantsStatsCards, AccountantsTableSkeleton } from '@/shared/components/accountants';
import { useAccountants } from '@/shared/hooks/useAccountants';

export default function AccountantsManagement() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
    const [page, setPage] = useState(1);
    const itemsPerPage = 25;

    const { accountants, loading, total, totalPages, reload } = useAccountants({ search, status, page, itemsPerPage });

    const stats = {
        total,
        active: accountants.filter(a => a.is_active).length, // active in current page
        inactive: accountants.filter(a => !a.is_active).length, // inactive in current page
    };

    const applyFilters = () => {
        setPage(1);
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('all');
        setPage(1);
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <AccountantsStatsCards total={stats.total} active={stats.active} inactive={stats.inactive} />

            {/* Table */}
            <Card>
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-semibold text-gray-900">Accountants</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <AccountantsFiltersModal
                            search={search}
                            status={status}
                            setSearch={setSearch}
                            setStatus={setStatus}
                            onApply={applyFilters}
                            onClear={clearFilters}
                        />
                        <Button onClick={() => setIsModalOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add New Accountant
                        </Button>
                    </div>
                </div>
                <CardContent className="p-0">
                    <div className="p-4">
                        {loading ? (
                            <AccountantsTableSkeleton />
                        ) : (
                            <AccountantsTable accountants={accountants} />
                        )}
                        {/* Pagination */}
                        <div className="mt-4 flex items-center justify-between px-2">
                            <div className="text-sm text-gray-500">
                                Showing {total === 0 ? 0 : ((page - 1) * itemsPerPage) + 1} to {Math.min(page * itemsPerPage, total)} of {total} accountants
                            </div>
                            <div className="flex items-center space-x-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setPage(Math.max(page - 1, 1))}
                                    disabled={page === 1 || loading}
                                    className="h-8 w-8 p-0"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setPage(Math.min(page + 1, totalPages))}
                                    disabled={page === totalPages || loading}
                                    className="h-8 w-8 p-0"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <AddAccountantModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreated={() => {
                    setIsModalOpen(false);
                    reload();
                }}
            />
        </div>
    );
} 