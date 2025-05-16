import { useEffect, useState } from "react";
import { fetchAccountingSummary } from "@/lib/supabase/accounting";
import { useToast } from "@/hooks/use-toast";
import { Loader2, TrendingUp, TrendingDown, Scale } from "lucide-react";
import { format } from "date-fns";

export function AccountingSummary() {
  const [summary, setSummary] = useState<{
    totalDebits: number;
    totalCredits: number;
    netBalance: number;
    period: {
      start: string;
      end: string;
    };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await fetchAccountingSummary();
      if (error) throw error;
      setSummary(data);
    } catch (error) {
      console.error("Error loading accounting summary:", error);
      toast({
        title: "Error",
        description: "Failed to load accounting summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32 bg-white rounded-lg border">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Loading summary...</span>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="text-center py-8 bg-white rounded-lg border">
        <p className="text-gray-500">No accounting data available for this period.</p>
      </div>
    );
  }

  const periodStart = new Date(summary.period.start);
  const periodEnd = new Date(summary.period.end);
  const periodLabel = `${format(periodStart, "MMMM yyyy")}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Accounting Summary</h2>
        <span className="text-sm text-gray-500">{periodLabel}</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <TrendingDown className="h-4 w-4" />
            <span className="text-sm font-medium">Total Debits</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            ${summary.totalDebits.toFixed(2)}
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">Total Credits</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            ${summary.totalCredits.toFixed(2)}
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Scale className="h-4 w-4" />
            <span className="text-sm font-medium">Net Balance</span>
          </div>
          <div className={`text-2xl font-bold ${
            summary.netBalance >= 0 ? "text-green-600" : "text-red-600"
          }`}>
            ${summary.netBalance.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
} 