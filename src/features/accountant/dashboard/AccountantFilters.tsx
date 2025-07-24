import { X, Filter } from "lucide-react";
import { Card } from "@/shared/components/Card";
import { Input } from "@/shared/components/Input";
import { Button } from "@/shared/components/Button";
import { Badge } from "@/shared/components/Badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/Select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/Dialog";
import { useState, useEffect } from "react";

interface AccountantFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    statusFilter: string;
    onStatusFilterChange: (value: string) => void;
    onClearFilters: () => void;
    totalResults?: number;
}

export function AccountantFilters({
    searchTerm,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
    onClearFilters,
    totalResults
}: AccountantFiltersProps) {
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [tempSearchTerm, setTempSearchTerm] = useState(searchTerm);
    const [tempStatusFilter, setTempStatusFilter] = useState(statusFilter);
    const hasFilters = searchTerm || statusFilter !== 'all';

    // Initialize temp filters when modal opens
    useEffect(() => {
        if (showFilterModal) {
            setTempSearchTerm(searchTerm);
            setTempStatusFilter(statusFilter);
        }
    }, [showFilterModal, searchTerm, statusFilter]);

    const handleApplyFilters = () => {
        onSearchChange(tempSearchTerm);
        onStatusFilterChange(tempStatusFilter);
        setShowFilterModal(false);
    };

    const handleClearModalFilters = () => {
        setTempSearchTerm("");
        setTempStatusFilter("all");
    };

    return (
        <>
            <Card className="p-4">
                {/* Filter Summary and Button */}
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">Client Management</h3>
                        {totalResults !== undefined && (
                            <p className="text-sm text-gray-500">
                                {totalResults} client{totalResults !== 1 ? 's' : ''} found
                            </p>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                        {hasFilters && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onClearFilters}
                                className="flex items-center space-x-1"
                            >
                                <X className="h-4 w-4" />
                                <span>Clear All</span>
                            </Button>
                        )}

                        <Button
                            variant="outline"
                            onClick={() => setShowFilterModal(true)}
                            className="flex items-center space-x-2"
                        >
                            <Filter className="h-4 w-4" />
                            <span>Filters</span>
                            {hasFilters && (
                                <Badge variant="secondary" className="ml-1">
                                    {[searchTerm, statusFilter !== 'all' ? statusFilter : ''].filter(Boolean).length}
                                </Badge>
                            )}
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Filter Modal */}
            <Dialog open={showFilterModal} onOpenChange={setShowFilterModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filter Clients
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Search */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Search
                            </label>
                            <Input
                                type="text"
                                placeholder="Search by client name..."
                                value={tempSearchTerm}
                                onChange={(e) => setTempSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <Select value={tempStatusFilter} onValueChange={setTempStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Clients</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="pending_review">Pending Review</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-4">
                            <Button onClick={handleApplyFilters} className="flex-1">
                                Apply
                            </Button>
                            <Button variant="outline" onClick={handleClearModalFilters} className="flex-1">
                                Clear
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
} 