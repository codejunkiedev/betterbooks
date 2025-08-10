import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/shared/components/Card';
import { AdminUser, AdminUsersFilters } from '@/shared/types/admin';
import { useToast } from '@/shared/hooks/useToast';
import {
    SearchModal,
    UserTable,
    UserTableSkeleton,
    StatsCards,
    Pagination,
    EmptyState
} from '@/features/admin/user-management';
import { getAdminUsers } from '@/shared/services/supabase/admin';

export default function UserManagement() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<AdminUsersFilters>({});
    const [page, setPage] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const itemsPerPage = 25;

    const { toast } = useToast();

    // Fetch users data
    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);

            const searchFilters: AdminUsersFilters = {
                ...filters,
                ...(searchTerm && { search: searchTerm })
            };

            const response = await getAdminUsers(page, itemsPerPage, searchFilters);

            if (response.error) {
                throw response.error;
            }

            if (response.data) {
                setUsers(response.data.items);
                setTotalUsers(response.data.total);
                setTotalPages(response.data.totalPages);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch users');
            toast({
                title: "Error",
                description: "Failed to fetch users. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    // Load users on component mount and when dependencies change
    useEffect(() => {
        fetchUsers();
    }, [page, filters, searchTerm]);

    // Handle search
    const handleSearch = () => {
        setPage(1); // Reset to first page when searching
        fetchUsers();
    };

    // Handle clear filters
    const handleClearFilters = () => {
        setSearchTerm('');
        setFilters({});
        setPage(1);
    };

    // Handle page change
    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    // Calculate stats
    const activeUsers = users.filter(user => user.status === 'active').length;
    const suspendedUsers = users.filter(user => user.status === 'suspended').length;
    const pendingUsers = users.filter(user => user.status === 'pending_verification').length;

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <StatsCards
                totalUsers={totalUsers}
                activeUsers={activeUsers}
                suspendedUsers={suspendedUsers}
                pendingUsers={pendingUsers}
                isLoading={loading}
            />

            {/* Users Table */}
            <Card>
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">Users</h2>
                    <SearchModal
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        filters={filters}
                        setFilters={setFilters}
                        onSearch={handleSearch}
                        onClearFilters={handleClearFilters}
                    />
                </div>

                <CardContent className="p-0">
                    {loading ? (
                        <UserTableSkeleton />
                    ) : users.length > 0 ? (
                        <UserTable users={users} />
                    ) : (
                        <EmptyState searchTerm={searchTerm} filters={filters} onClearFilters={handleClearFilters} />
                    )}
                </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    totalUsers={totalUsers}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
} 