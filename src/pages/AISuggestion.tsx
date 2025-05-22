import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileText, Check, Edit2, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { InvoiceSuggestionType } from "@/interfaces/suggestion";
import {
  fetchInvoiceSuggestions,
  updateInvoiceSuggestion
} from "@/lib/supabase/suggestion";
import { getInvoiceLineItems } from '../lib/supabase/line-item';
import { LineItem } from '../interfaces/line-item';
import { getFileUrl } from "@/lib/supabase/storage";
import { LoadingSpinner, Skeleton } from "@/components/ui/loading";
import { InvoicePreview } from "@/components/shared/InvoicePreview";

const ITEMS_PER_PAGE = 5;

const InvoiceSuggestion = () => {
  const [suggestions, setSuggestions] = useState<InvoiceSuggestionType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ debit: string; credit: string; amount: string }>({
    debit: "",
    credit: "",
    amount: ""
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const { toast } = useToast();
  const [selectedLineItems, setSelectedLineItems] = useState<LineItem[]>([]);
  const [showLineItems, setShowLineItems] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    loadSuggestions();
  }, [currentPage]);

  const loadSuggestions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await fetchInvoiceSuggestions(currentPage, ITEMS_PER_PAGE);
      if (error) throw error;
      setSuggestions(data?.items || []);
      setTotalItems(data?.total || 0);
    } catch (error: unknown) {
      console.error("Error fetching invoice suggestions:", error);
      toast({
        title: "Error Fetching Suggestions",
        description: error instanceof Error ? error.message : "Could not retrieve invoice suggestions from the database.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const suggestion = suggestions.find(s => s.id === id);
      if (!suggestion) throw new Error("Suggestion not found");

      const { error } = await updateInvoiceSuggestion(id, suggestion.deepseek_response);
      if (error) throw error;

      setSuggestions(prev => prev.filter(s => s.id !== id));

      toast({
        title: "Entry Approved",
        description: "The accounting entry has been approved successfully.",
      });
    } catch (error: unknown) {
      console.error("Error approving entry:", error);
      toast({
        title: "Error",
        description: "Failed to approve the entry. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRowClick = (suggestion: InvoiceSuggestionType) => {
    setEditingId(suggestion.id);
    setEditValues({
      debit: suggestion.deepseek_response.debitAccount,
      credit: suggestion.deepseek_response.creditAccount,
      amount: suggestion.deepseek_response.amount?.toString() || ""
    });
    setIsModalOpen(true);
    fetchLineItems(suggestion.id);
  };

  const fetchLineItems = async (invoiceId: string) => {
    const { data, error } = await getInvoiceLineItems(invoiceId);
    if (error) {
      console.error("Error fetching line items:", error);
      toast({
        title: "Error",
        description: "Failed to fetch line items. Please try again.",
        variant: "destructive",
      });
      return;
    }
    setSelectedLineItems(data || []);
    setShowLineItems(data ? data.length > 0 : false);
  };

  const handleSave = async (id: string) => {
    setIsSaving(true);
    try {
      const suggestion = suggestions.find(s => s.id === id);
      if (!suggestion) throw new Error("Suggestion not found");

      const updatedDeepseekResponse = {
        ...suggestion.deepseek_response,
        debitAccount: editValues.debit,
        creditAccount: editValues.credit,
        amount: parseFloat(editValues.amount) || suggestion.deepseek_response.amount
      };

      const { error } = await updateInvoiceSuggestion(id, updatedDeepseekResponse);
      if (error) throw error;

      setSuggestions(prev => prev.filter(s => s.id !== id));
      setEditingId(null);
      setIsModalOpen(false);

      toast({
        title: "Changes Saved",
        description: "The accounting entry has been updated and approved successfully.",
      });
    } catch (error: unknown) {
      console.error("Error saving changes:", error);
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handlePreview = async (suggestion: InvoiceSuggestionType) => {
    try {
      const url = await getFileUrl(suggestion.file.path);
      if (url) {
        setPreviewUrl(url);
        setIsPreviewOpen(true);
      }
    } catch (error) {
      console.error('Error generating preview URL:', error);
      toast({
        title: "Error",
        description: "Failed to generate preview URL. Please try again.",
        variant: "destructive",
      });
    }
  };

  const LineItemsView = ({ lineItems }: { lineItems: LineItem[] }) => {
    if (lineItems.length === 0) return null;

    return (
      <div className="mt-4 border p-4 rounded-lg">
        <h3 className="font-medium text-lg mb-2">Asset Line Items</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Asset Type</TableHead>
                <TableHead>Useful Life (months)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lineItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.unit_price ? `PKR ${item.unit_price.toFixed(2)}` : 'N/A'}</TableCell>
                  <TableCell>PKR {item.amount.toFixed(2)}</TableCell>
                  <TableCell>{item.asset_type || 'N/A'}</TableCell>
                  <TableCell>{item.asset_life_months || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Invoice Suggestions</h1>
            <p className="text-gray-500 mt-2">
              Review and approve AI-generated suggestions for your uploaded invoices.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Invoices</h2>
            </div>

            <div className="bg-white rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-[200px] min-w-[200px] max-w-[200px]">File Name</TableHead>
                    <TableHead>Preview</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Debit Account</TableHead>
                    <TableHead>Credit Account</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead className="w-[150px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell className="w-[200px] min-w-[200px] max-w-[200px]"><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-64" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls Skeleton */}
            <div className="mt-4 flex items-center justify-between px-2">
              <Skeleton className="h-4 w-48" />
              <div className="flex items-center space-x-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-lg border">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Invoice Suggestions Yet</h3>
            <p className="text-gray-500">Upload an invoice, and AI suggestions will appear here.</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Invoices</h2>
                {isLoading && (
                  <LoadingSpinner size="sm" />
                )}
              </div>

              <div className="bg-white rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-[200px] min-w-[200px] max-w-[200px]">File Name</TableHead>
                      <TableHead>Preview</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Debit Account</TableHead>
                      <TableHead>Credit Account</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead className="w-[150px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suggestions.map((suggestion) => (
                      <TableRow key={suggestion.id}>
                        <TableCell>{new Date(suggestion.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="w-[200px] min-w-[200px] max-w-[200px]">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="truncate cursor-help">
                                  {suggestion.file.name}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{suggestion.file.name}</p>
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
                                  onClick={() => handlePreview(suggestion)}
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
                          <span className={`inline-flex items-center justify-center w-full px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide ${!suggestion.type
                            ? 'bg-gray-50/50 text-gray-400 border border-gray-100 shadow-sm'
                            : suggestion.type === 'debit'
                              ? 'bg-green-50/80 text-green-700 border border-green-100 shadow-sm hover:bg-green-50'
                              : 'bg-red-50/80 text-red-700 border border-red-100 shadow-sm hover:bg-red-50'
                            }`}>
                            {!suggestion.type ? 'N/A' : suggestion.type === 'debit' ? 'DEBIT' : 'CREDIT'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="max-w-md truncate cursor-help">
                                  {suggestion.deepseek_response.explanation}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-md whitespace-normal">{suggestion.deepseek_response.explanation}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell>{suggestion.deepseek_response.debitAccount}</TableCell>
                        <TableCell>{suggestion.deepseek_response.creditAccount}</TableCell>
                        <TableCell>PKR {suggestion.deepseek_response.amount?.toFixed(2)}</TableCell>
                        <TableCell>
                          {(suggestion.deepseek_response.confidence * 100).toFixed(0)}%
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleRowClick(suggestion)}
                                    className="h-8"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Edit accounting entry</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            {suggestion.status !== "approved" && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      onClick={() => handleApprove(suggestion.id)}
                                      className="h-8"
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Approve this entry</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Pagination Controls */}
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
                </Button>
                <div className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Accounting Entry</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="debit">Debit Account</Label>
                <Input
                  id="debit"
                  value={editValues.debit}
                  onChange={(e) => setEditValues(prev => ({ ...prev, debit: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="credit">Credit Account</Label>
                <Input
                  id="credit"
                  value={editValues.credit}
                  onChange={(e) => setEditValues(prev => ({ ...prev, credit: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={editValues.amount}
                  onChange={(e) => setEditValues(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={() => handleSave(editingId!)} disabled={isSaving}>
                {isSaving ? (
                  <LoadingSpinner size="sm" text="Saving..." />
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
          {showLineItems && <LineItemsView lineItems={selectedLineItems} />}
        </Dialog>

        <InvoicePreview
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          previewUrl={previewUrl}
        />

        <div className="mt-12 bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-lg">
                1
              </div>
              <h3 className="font-medium text-gray-700">Upload Invoice</h3>
              <p className="text-sm text-gray-600">
                Upload your invoice files (e.g., PDF, PNG).
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-lg">
                2
              </div>
              <h3 className="font-medium text-gray-700">AI Processing</h3>
              <p className="text-sm text-gray-600">
                Our AI analyzes the invoice to extract key information.
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-lg">
                3
              </div>
              <h3 className="font-medium text-gray-700">Review & Approve</h3>
              <p className="text-sm text-gray-600">
                Review the suggestions and approve or make adjustments as needed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceSuggestion; 