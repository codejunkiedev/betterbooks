import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/Dialog';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/Select';
import { Filter } from 'lucide-react';

interface Props {
    search: string;
    status: 'all' | 'active' | 'inactive';
    setSearch: (v: string) => void;
    setStatus: (v: 'all' | 'active' | 'inactive') => void;
    onApply: () => void;
    onClear: () => void;
}

export function AccountantsFiltersModal({ search, status, setSearch, setStatus, onApply, onClear }: Props) {
    const [open, setOpen] = useState(false);
    const [localSearch, setLocalSearch] = useState(search);
    const [localStatus, setLocalStatus] = useState<typeof status>(status);

    useEffect(() => {
        if (open) {
            setLocalSearch(search);
            setLocalStatus(status);
        }
    }, [open, search, status]);

    const apply = () => {
        setSearch(localSearch);
        setStatus(localStatus);
        onApply();
        setOpen(false);
    };

    const clear = () => {
        setLocalSearch('');
        setLocalStatus('all');
        onClear();
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Filter Accountants</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm text-gray-700">Search</label>
                        <Input value={localSearch} onChange={(e) => setLocalSearch(e.target.value)} placeholder="Name, ID, or phone" />
                    </div>
                    <div>
                        <label className="text-sm text-gray-700">Status</label>
                        <Select value={localStatus} onValueChange={(v: 'all' | 'active' | 'inactive') => setLocalStatus(v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex justify-between pt-2">
                        <Button variant="ghost" onClick={clear}>Clear</Button>
                        <Button onClick={apply}>Apply</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
} 