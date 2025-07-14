import { useState, useEffect, useCallback } from "react";
import { Button } from "@/shared/components/Button";
import { useToast } from "@/shared/hooks/useToast";
import { ChevronLeft, ChevronRight, Eye, FileText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/Table";
import { AccountingEntry } from "@/shared/types/accounting";
import { fetchAccountingEntries } from "@/shared/services/supabase/accounting";
import { Skeleton } from "@/shared/components/Loading";
import { InvoicePreview } from "@/shared/components/DocumentPreview";
import { getFileUrl } from "@/shared/services/supabase/storage";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/Tooltip";

const ITEMS_PER_PAGE = 5;

const AccountingEntriesTable = () => {
  const [entries, setEntries] = useState<AccountingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { toast } = useToast();

  const loadEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await fetchAccountingEntries(currentPage, ITEMS_PER_PAGE);
      if (error) throw error;
      setEntries(data?.items as AccountingEntry[] || []);
      setTotalItems(data?.total || 0);
    } catch (error: unknown) {
      console.error("Error fetching accounting entries:", error);
      toast({
        title: "Error Fetching Entries",
        description: error instanceof Error ? error.message : "Could not retrieve accounting entries from the database.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, toast]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePreview = async (entry: AccountingEntry) => {
    const url = await getFileUrl(entry.file.path);
    setPreviewUrl(url);
    setIsPreviewOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Accounting Entries</h2>
        </div>
        <div className="bg-white rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="w-[200px] min-w-[200px] max-w-[200px]">File Name</TableHead>
                <TableHead>Preview</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Debit Account</TableHead>
                <TableHead>Credit Account</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell className="w-[200px] min-w-[200px] max-w-[200px]"><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Accounting Entries</h2>
      </div>
      <div className="bg-white rounded-lg border overflow-hidden min-h-[220px] flex flex-col justify-center">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-1">No Accounting Entries Yet</h3>
            <p className="text-gray-500">Approve an invoice, and accounting entries will appear here.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="w-[200px] min-w-[200px] max-w-[200px]">File Name</TableHead>
                <TableHead>Preview</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Debit Account</TableHead>
                <TableHead>Credit Account</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{new Date(entry.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="w-[200px] min-w-[200px] max-w-[200px]">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="truncate cursor-help">
                            {entry.file.name}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{entry.file.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePreview(entry)}
                            className="h-8"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Preview invoice</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="max-w-md truncate cursor-help">
                            {entry.data.explanation}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-md whitespace-normal">{entry.data.explanation}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>{entry.data.debitAccount}</TableCell>
                  <TableCell>{entry.data.creditAccount}</TableCell>
                  <TableCell className="text-right">
                    PKR {entry.data.amount?.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      {/* Pagination Controls */}
      {entries.length > 0 && totalItems > 0 && (
        <div className="mt-4 flex items-center justify-between px-2">
          <div className="text-sm text-gray-500">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems} entries
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewUrl && (
        <InvoicePreview
          previewUrl={previewUrl}
          isOpen={isPreviewOpen}
          onClose={() => {
            setIsPreviewOpen(false);
            setPreviewUrl(null);
          }}
        />
      )}
    </div>
  );
};

export default AccountingEntriesTable; 