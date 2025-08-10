import { Button } from '@/shared/components/Button';
import { Users } from 'lucide-react';
import { AdminUsersFilters } from '@/shared/types/admin';

interface EmptyStateProps {
    searchTerm: string;
    filters: AdminUsersFilters;
    onClearFilters: () => void;
}

export const EmptyState = ({ searchTerm, filters, onClearFilters }: EmptyStateProps) => {
    const hasFiltersOrSearch = Object.keys(filters).length > 0 || searchTerm;

    return (
        <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">
                {hasFiltersOrSearch
                    ? 'Try adjusting your search or filter criteria.'
                    : 'No users are currently registered'}
            </p>
            {hasFiltersOrSearch && (
                <Button onClick={onClearFilters} className="mt-4">
                    Clear Filters
                </Button>
            )}
        </div>
    );
}; 