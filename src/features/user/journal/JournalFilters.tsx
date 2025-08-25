import { X, Filter } from "lucide-react";
import { Card } from "@/shared/components/Card";
import { Input } from "@/shared/components/Input";
import { Button } from "@/shared/components/Button";
import { Badge } from "@/shared/components/Badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/Dialog";
import { useState, useEffect } from "react";

interface JournalFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    dateFilter: string;
    onDateFilterChange: (value: string) => void;
    onClearFilters: () => void;
    totalResults?: number;
}

export function JournalFilters({
    searchTerm,
    onSearchChange,
    dateFilter,
    onDateFilterChange,
    onClearFilters,
    totalResults
}: JournalFiltersProps) {
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [tempSearchTerm, setTempSearchTerm] = useState(searchTerm);
    const [tempDateFilter, setTempDateFilter] = useState(dateFilter);
    const hasFilters = searchTerm || dateFilter;

    // Initialize temp filters when modal opens
    useEffect(() => {
        if (showFilterModal) {
            setTempSearchTerm(searchTerm);
            setTempDateFilter(dateFilter);
        }
    }, [showFilterModal, searchTerm, dateFilter]);

    const handleApplyFilters = () => {
        onSearchChange(tempSearchTerm);
        onDateFilterChange(tempDateFilter);
        setShowFilterModal(false);
    };

    const handleClearModalFilters = () => {
        setTempSearchTerm("");
        setTempDateFilter("");
    };

    return (
        <>
            <Card className="p-4">
                {/* Filter Summary and Button */}
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">Journal Entries</h3>
                        {totalResults !== undefined && (
                            <p className="text-sm text-gray-500">
                                {totalResults} result{totalResults !== 1 ? 's' : ''} found
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
                                    {[searchTerm, dateFilter].filter(Boolean).length}
                                </Badge>
                            )}
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Simple Filter Modal */}
            <Dialog open={showFilterModal} onOpenChange={setShowFilterModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filter Journal Entries
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Search */}
                        <div>
                            <Input
                                type="text"
                                placeholder="Search by description or account name..."
                                value={tempSearchTerm}
                                onChange={(e) => setTempSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Date Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date
                            </label>
                            <Input
                                type="date"
                                value={tempDateFilter}
                                onChange={(e) => setTempDateFilter(e.target.value)}
                            />
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