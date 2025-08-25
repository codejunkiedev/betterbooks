import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/shared/components/Card";
import { Badge } from "@/shared/components/Badge";
import { Button } from "@/shared/components/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/Table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/Tooltip";

interface JournalEntry {
    id: string;
    entry_date: string;
    description: string;
    is_adjusting_entry: boolean;
    created_at: string;
    lines: Array<{
        id: string;
        account_id: string;
        account_name: string;
        type: 'DEBIT' | 'CREDIT';
        amount: number;
    }>;
}

interface JournalTableProps {
    entries: JournalEntry[];
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    onPageChange: (page: number) => void;
}

export function JournalTable({ entries, currentPage, itemsPerPage, totalItems, onPageChange }: JournalTableProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), "MMM dd, yyyy");
    };

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return (
        <Card className="p-6">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Account</TableHead>
                            <TableHead className="text-right">Debit</TableHead>
                            <TableHead className="text-right">Credit</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {entries.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                    No journal entries found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            entries.map((entry) => (
                                <TableRow key={entry.id} className="hover:bg-gray-50">
                                    <TableCell className="font-medium">
                                        {formatDate(entry.entry_date)}
                                    </TableCell>
                                    <TableCell>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="truncate cursor-help max-w-md">
                                                        {entry.description}
                                                        {entry.is_adjusting_entry && (
                                                            <Badge variant="secondary" className="ml-2 text-xs">
                                                                Adjusting
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <div className="max-w-md whitespace-normal">
                                                        {entry.description}
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </TableCell>
                                    <TableCell>
                                        {entry.lines.map((line, index) => (
                                            <div key={line.id} className={index > 0 ? "mt-1" : ""}>
                                                {line.account_name}
                                            </div>
                                        ))}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {entry.lines
                                            .filter(line => line.type === 'DEBIT')
                                            .map(line => (
                                                <div key={line.id} className="text-green-600">
                                                    {formatCurrency(line.amount)}
                                                </div>
                                            ))}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {entry.lines
                                            .filter(line => line.type === 'CREDIT')
                                            .map(line => (
                                                <div key={line.id} className="text-red-600">
                                                    {formatCurrency(line.amount)}
                                                </div>
                                            ))}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            {entries.length > 0 && totalItems > 0 && (
                <div className="mt-6 flex items-center justify-between px-2">
                    <div className="text-sm text-gray-500">
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="text-sm text-gray-500">
                            Page {currentPage} of {totalPages}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );
} 