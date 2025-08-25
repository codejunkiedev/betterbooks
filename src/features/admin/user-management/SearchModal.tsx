import { useState } from 'react';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/Select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/Dialog';
import { Badge } from '@/shared/components/Badge';
import { Filter } from 'lucide-react';
import { AdminUsersFilters } from '@/shared/types/admin';

interface SearchModalProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    filters: AdminUsersFilters;
    setFilters: (filters: AdminUsersFilters) => void;
    onSearch: () => void;
    onClearFilters: () => void;
}

export const SearchModal = ({
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    onSearch,
    onClearFilters
}: SearchModalProps) => {
    const [isOpen, setIsOpen] = useState(false);

    // Count active filters
    const getActiveFiltersCount = () => {
        let count = 0;
        if (searchTerm) count++;
        if (filters.status && filters.status !== 'all') count++;
        if (filters.role && filters.role !== 'all') count++;
        if (filters.registration_date_from) count++;
        if (filters.registration_date_to) count++;
        return count;
    };

    const handleFilterChange = (key: keyof AdminUsersFilters, value: string | string[] | undefined) => {
        if (value === undefined || (typeof value === 'string' && value === 'all')) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [key]: _, ...rest } = filters;
            setFilters(rest);
        } else {
            setFilters({ ...filters, [key]: value });
        }
    };

    const handleSearch = () => {
        onSearch();
        setIsOpen(false);
    };

    const handleClear = () => {
        onClearFilters();
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                    {getActiveFiltersCount() > 0 && (
                        <Badge variant="secondary" className="ml-1">
                            {getActiveFiltersCount()}
                        </Badge>
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl" aria-describedby="search-users-description">
                <DialogHeader>
                    <DialogTitle>Search & Filter Users</DialogTitle>
                    <p id="search-users-description" className="text-sm text-gray-600">
                        Search and filter users by various criteria including status, role, and registration date.
                    </p>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Search Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Search
                        </label>
                        <Input
                            placeholder="Search by company name, contact name, or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full"
                        />
                    </div>

                    {/* Filters Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <Select value={filters.status || 'all'} onValueChange={(value) => handleFilterChange('status', value === 'all' ? undefined : value as string)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="suspended">Suspended</SelectItem>
                                    <SelectItem value="pending_verification">Pending Verification</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Role Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Role
                            </label>
                            <Select value={filters.role || 'all'} onValueChange={(value) => handleFilterChange('role', value === 'all' ? undefined : value as string)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Roles" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    <SelectItem value="USER">User</SelectItem>
                                    <SelectItem value="ACCOUNTANT">Accountant</SelectItem>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Registration Date From */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Registration From
                            </label>
                            <Input
                                type="date"
                                value={filters.registration_date_from || ''}
                                onChange={(e) => handleFilterChange('registration_date_from', e.target.value)}
                            />
                        </div>

                        {/* Registration Date To */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Registration To
                            </label>
                            <Input
                                type="date"
                                value={filters.registration_date_to || ''}
                                onChange={(e) => handleFilterChange('registration_date_to', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button variant="outline" onClick={handleClear}>
                            Clear All
                        </Button>
                        <Button onClick={handleSearch}>
                            Apply Filters
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}; 