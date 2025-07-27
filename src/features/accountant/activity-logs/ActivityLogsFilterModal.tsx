import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/Dialog";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/Select";
import { Label } from "@/shared/components/Label";
import { Filter, Calendar } from "lucide-react";
import { ActivityType } from "@/shared/types/activity";
import { activityTypeOptions } from "@/shared/constants";
import React from "react";

interface Company {
    id: string;
    name: string;
}

interface ActivityLogsFilterModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    tempFilters: {
        activity_type: ActivityType | "all";
        company_id: string;
        date_from: string;
        date_to: string;
    };
    setTempFilters: React.Dispatch<React.SetStateAction<{
        activity_type: ActivityType | "all";
        company_id: string;
        date_from: string;
        date_to: string;
    }>>;
    onApplyFilters: () => void;
    onClearFilters: () => void;
    companies: Company[];
}

export const ActivityLogsFilterModal: React.FC<ActivityLogsFilterModalProps> = ({
    isOpen,
    onOpenChange,
    tempFilters,
    setTempFilters,
    onApplyFilters,
    onClearFilters,
    companies,
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filter Activity Logs
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="activity-type-filter">Activity Type</Label>
                        <Select
                            value={tempFilters.activity_type}
                            onValueChange={(value) => setTempFilters(prev => ({
                                ...prev,
                                activity_type: value as ActivityType | "all"
                            }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All activities" />
                            </SelectTrigger>
                            <SelectContent>
                                {activityTypeOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="company-filter">Company</Label>
                        <Select
                            value={tempFilters.company_id}
                            onValueChange={(value) => setTempFilters(prev => ({
                                ...prev,
                                company_id: value
                            }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All companies" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Companies</SelectItem>
                                {companies.map((company) => (
                                    <SelectItem key={company.id} value={company.id}>
                                        {company.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="date-from">Date From</Label>
                        <div className="relative">
                            <Input
                                id="date-from"
                                type="date"
                                value={tempFilters.date_from}
                                onChange={(e) => setTempFilters(prev => ({
                                    ...prev,
                                    date_from: e.target.value
                                }))}
                                className="pr-10"
                            />
                            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="date-to">Date To</Label>
                        <div className="relative">
                            <Input
                                id="date-to"
                                type="date"
                                value={tempFilters.date_to}
                                onChange={(e) => setTempFilters(prev => ({
                                    ...prev,
                                    date_to: e.target.value
                                }))}
                                className="pr-10"
                            />
                            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                    <div className="flex gap-2 pt-4">
                        <Button onClick={onApplyFilters} className="flex-1">
                            Apply Filters
                        </Button>
                        <Button variant="outline" onClick={onClearFilters} className="flex-1">
                            Clear All
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}; 