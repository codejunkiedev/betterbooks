import { useEffect, useState } from "react";
import { fetchAccountingSummary } from "@/lib/supabase/accounting";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, TrendingDown, Scale } from "lucide-react";
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
  const { toast } = useToast();

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
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
    }
  };

  if (!summary) {
    return (
      <div className="text-center py-8 bg-white rounded-lg border">
        <p className="text-gray-500">No accounting data available for this period.</p>
      </div>
    );
  }

  const periodStart = new Date(summary.period.start);
  const periodLabel = `${format(periodStart, "MMMM yyyy")}`;

  const summaryData = [
    {
      icon: <TrendingDown className="h-6 w-6 text-black" />,
      label: "Total Debits",
      value: summary.totalDebits,
      color: "text-gray-900"
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-black" />,
      label: "Total Credits",
      value: summary.totalCredits,
      color: "text-gray-900"
    },
    {
      icon: <Scale className="h-6 w-6 text-black" />,
      label: "Net Balance",
      value: summary.netBalance,
      color: summary.netBalance >= 0 ? "text-green-600" : "text-red-600"
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Accounting Summary</h2>
        <span className="text-sm text-gray-500">{periodLabel}</span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {summaryData.map((item, index) => (
          <div key={index} className="bg-white p-5 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-100">
                <div className="text-blue-600 w-5 h-5">
                  {item.icon}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600 truncate">{item.label}</p>
                <p className={`text-xl font-semibold ${item.color} mt-1`}>
                  ${item.value.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}