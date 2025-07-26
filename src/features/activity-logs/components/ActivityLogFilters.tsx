import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/Select';
import { Badge } from '@/shared/components/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/Dialog';
import { activityTypeLabels } from '../constants';

interface ActivityLogFiltersProps {
    activityTypeFilter: string;
    setActivityTypeFilter: (value: string) => void;
    dateFromFilter: string;
    setDateFromFilter: (value: string) => void;
    dateToFilter: string;
    setDateToFilter: (value: string) => void;
    searchFilter: string;
    setSearchFilter: (value: string) => void;
    onFilterChange: () => void;
    onClearFilters: () => void;
}

export default function ActivityLogFilters({
    activityTypeFilter,
    setActivityTypeFilter,
    dateFromFilter,
    setDateFromFilter,
    dateToFilter,
    setDateToFilter,
    searchFilter,
    setSearchFilter,
    onFilterChange,
    onClearFilters
}: ActivityLogFiltersProps) {
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

    return (
        <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Modal */}
            <Dialog open={isSearchModalOpen} onOpenChange={setIsSearchModalOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto">
                        <Search className="w-4 h-4 mr-2" />
                        Search & Filters
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Search & Filter Activities</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Search</label>
                            <Input
                                placeholder="Search activities..."
                                value={searchFilter}
                                onChange={(e) => setSearchFilter(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Activity Type</label>
                            <Select value={activityTypeFilter} onValueChange={(value) => setActivityTypeFilter(value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select activity type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Activities</SelectItem>
                                    {Object.entries(activityTypeLabels).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Date From</label>
                                <Input
                                    type="date"
                                    value={dateFromFilter}
                                    onChange={(e) => setDateFromFilter(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Date To</label>
                                <Input
                                    type="date"
                                    value={dateToFilter}
                                    onChange={(e) => setDateToFilter(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 pt-4">
                            <Button
                                onClick={() => {
                                    onFilterChange();
                                    setIsSearchModalOpen(false);
                                }}
                                className="flex-1"
                            >
                                Apply Filters
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    onClearFilters();
                                    setIsSearchModalOpen(false);
                                }}
                                className="flex-1"
                            >
                                Clear
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Active Filters Display */}
            {(activityTypeFilter !== 'all' || dateFromFilter || dateToFilter || searchFilter) && (
                <div className="flex flex-wrap gap-2">
                    {activityTypeFilter !== 'all' && (
                        <Badge className="text-xs bg-gray-100 text-gray-700 border-gray-200">
                            {activityTypeLabels[activityTypeFilter as ActivityType]}
                            <X
                                className="w-3 h-3 ml-1 cursor-pointer"
                                onClick={() => setActivityTypeFilter('all')}
                            />
                        </Badge>
                    )}
                    {dateFromFilter && (
                        <Badge className="text-xs bg-gray-100 text-gray-700 border-gray-200">
                            From: {dateFromFilter}
                            <X
                                className="w-3 h-3 ml-1 cursor-pointer"
                                onClick={() => setDateFromFilter('')}
                            />
                        </Badge>
                    )}
                    {dateToFilter && (
                        <Badge className="text-xs bg-gray-100 text-gray-700 border-gray-200">
                            To: {dateToFilter}
                            <X
                                className="w-3 h-3 ml-1 cursor-pointer"
                                onClick={() => setDateToFilter('')}
                            />
                        </Badge>
                    )}
                    {searchFilter && (
                        <Badge className="text-xs bg-gray-100 text-gray-700 border-gray-200">
                            Search: {searchFilter}
                            <X
                                className="w-3 h-3 ml-1 cursor-pointer"
                                onClick={() => setSearchFilter('')}
                            />
                        </Badge>
                    )}
                </div>
            )}
        </div>
    );
} 