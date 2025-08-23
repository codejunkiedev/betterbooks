import { useState } from 'react';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/Select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/shared/components/Dialog';
import { Badge } from '@/shared/components/Badge';
import { Filter, Search } from 'lucide-react';
import { FBR_SCENARIO_STATUS } from '@/shared/constants/fbr';
import type { FbrScenarioWithProgress } from '@/shared/types/fbr';

export interface SandboxSearchFilters {
    searchTerm: string;
    status: string;
    category: string;
    saleType: string;
    scenarioId: string;
}

interface FiltersModalProps {
    filters: SandboxSearchFilters;
    setFilters: (filters: SandboxSearchFilters) => void;
    scenarios: FbrScenarioWithProgress[];
    onSearch: () => void;
    onClearFilters: () => void;
}

export const SearchModal = ({
    filters,
    setFilters,
    scenarios,
    onSearch,
    onClearFilters
}: FiltersModalProps) => {
    const [isOpen, setIsOpen] = useState(false);

    // Get unique categories and sale types from scenarios
    const categories = Array.from(new Set(scenarios.map(s => s.category))).sort();
    const saleTypes = Array.from(new Set(scenarios.map(s => s.saleType))).sort();
    const scenarioIds = Array.from(new Set(scenarios.map(s => s.scenarioId))).sort();

    // Count active filters
    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.searchTerm) count++;
        if (filters.status && filters.status !== 'all') count++;
        if (filters.category && filters.category !== 'all') count++;
        if (filters.saleType && filters.saleType !== 'all') count++;
        if (filters.scenarioId && filters.scenarioId !== 'all') count++;
        return count;
    };

    const handleFilterChange = (key: keyof SandboxSearchFilters, value: string) => {
        if (value === 'all') {
            setFilters({ ...filters, [key]: '' });
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
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filter Scenarios
                    </DialogTitle>
                    <DialogDescription>
                        Use these filters to narrow down the scenarios based on status, category, sale type, and scenario ID.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Search Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Search Description
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search scenario descriptions..."
                                value={filters.searchTerm}
                                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Filters Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <Select
                                value={filters.status || 'all'}
                                onValueChange={(value) => handleFilterChange('status', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value={FBR_SCENARIO_STATUS.NOT_STARTED}>Not Started</SelectItem>
                                    <SelectItem value={FBR_SCENARIO_STATUS.IN_PROGRESS}>In Progress</SelectItem>
                                    <SelectItem value={FBR_SCENARIO_STATUS.COMPLETED}>Completed</SelectItem>
                                    <SelectItem value={FBR_SCENARIO_STATUS.FAILED}>Failed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Category Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category
                            </label>
                            <Select
                                value={filters.category || 'all'}
                                onValueChange={(value) => handleFilterChange('category', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map(category => (
                                        <SelectItem key={category} value={category}>
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Sale Type Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sale Type
                            </label>
                            <Select
                                value={filters.saleType || 'all'}
                                onValueChange={(value) => handleFilterChange('saleType', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Sale Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Sale Types</SelectItem>
                                    {saleTypes.map(saleType => (
                                        <SelectItem key={saleType} value={saleType}>
                                            {saleType}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Scenario ID Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Scenario ID
                            </label>
                            <Select
                                value={filters.scenarioId || 'all'}
                                onValueChange={(value) => handleFilterChange('scenarioId', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Scenario IDs" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Scenario IDs</SelectItem>
                                    {scenarioIds.map(scenarioId => (
                                        <SelectItem key={scenarioId} value={scenarioId}>
                                            {scenarioId}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
