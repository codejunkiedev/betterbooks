import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { Label } from '@/shared/components/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/Select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/Dialog';
import { Search, Filter, X } from 'lucide-react';

interface InvoiceFilters {
    search: string;
    status: string;
    dateFrom?: string;
    dateTo?: string;
    buyer: string;
    amountMin: string;
    amountMax: string;
}

interface InvoiceSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    filters: InvoiceFilters;
    onFiltersChange: (filters: InvoiceFilters) => void;
    onApplyFilters: () => void;
    onClearFilters: () => void;
}

export function InvoiceSearchModal({
    isOpen,
    onClose,
    filters,
    onFiltersChange,
    onApplyFilters,
    onClearFilters
}: InvoiceSearchModalProps) {
    const handleFilterChange = (key: keyof InvoiceFilters, value: string) => {
        onFiltersChange({
            ...filters,
            [key]: value
        });
    };

    const handleApply = () => {
        onApplyFilters();
        onClose();
    };

    const handleClear = () => {
        onClearFilters();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Filter className="w-5 h-5" />
                        Advanced Search & Filters
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Search */}
                    <div className="space-y-2">
                        <Label htmlFor="search">Search</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                id="search"
                                placeholder="Search by invoice number or buyer name..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Status and Date Range */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                                value={filters.status}
                                onValueChange={(value) => handleFilterChange('status', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="submitted">Submitted</SelectItem>
                                    <SelectItem value="failed">Failed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dateFrom">From Date</Label>
                            <Input
                                id="dateFrom"
                                type="date"
                                value={filters.dateFrom || ''}
                                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dateTo">To Date</Label>
                            <Input
                                id="dateTo"
                                type="date"
                                value={filters.dateTo || ''}
                                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Buyer and Amount Range */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="buyer">Buyer</Label>
                            <Input
                                id="buyer"
                                placeholder="Search by buyer name..."
                                value={filters.buyer}
                                onChange={(e) => handleFilterChange('buyer', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amountMin">Min Amount</Label>
                            <Input
                                id="amountMin"
                                type="number"
                                placeholder="0.00"
                                value={filters.amountMin}
                                onChange={(e) => handleFilterChange('amountMin', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amountMax">Max Amount</Label>
                            <Input
                                id="amountMax"
                                type="number"
                                placeholder="999999.99"
                                value={filters.amountMax}
                                onChange={(e) => handleFilterChange('amountMax', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button variant="outline" onClick={handleClear}>
                            <X className="w-4 h-4 mr-2" />
                            Clear All
                        </Button>
                        <Button onClick={handleApply}>
                            <Filter className="w-4 h-4 mr-2" />
                            Apply Filters
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
