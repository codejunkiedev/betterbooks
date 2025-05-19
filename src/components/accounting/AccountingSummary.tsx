import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Scale } from "lucide-react";
import { format } from "date-fns";
import { AccountingSummaryType } from "@/interfaces/accounting";
import { fetchAccountingSummary } from "@/lib/supabase/accounting";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/loading";

export function AccountingSummary() {
  const [summary, setSummary] = useState<AccountingSummaryType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const { data, error } = await fetchAccountingSummary();
        if (error) throw error;
        setSummary(data);
      } catch (error: unknown) {
        console.error("Error fetching accounting summary:", error);
        toast({
          title: "Error",
          description: "Failed to load accounting summary. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSummary();
  }, [toast]);

  const getPeriodLabel = () => {
    if (!summary?.period?.start) return "Current Period";
    try {
      const periodStart = new Date(summary.period.start);
      if (isNaN(periodStart.getTime())) return "Current Period";
      return format(periodStart, "MMMM yyyy");
    } catch {
      return "Current Period";
    }
  };

  const stats = [
    {
      icon: <TrendingDown className="h-6 w-6 text-black" />,
      label: "Total Debits",
      value: summary?.totalDebits || 0,
      color: "text-gray-900"
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-black" />,
      label: "Total Credits",
      value: summary?.totalCredits || 0,
      color: "text-gray-900"
    },
    {
      icon: <Scale className="h-6 w-6 text-black" />,
      label: "Net Balance",
      value: summary?.netBalance || 0,
      color: (summary?.netBalance ?? 0) >= 0 ? "text-green-600" : "text-red-600"
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Accounting Summary</h2>
        <span className="text-sm text-gray-500">{getPeriodLabel()}</span>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {stat.icon}
                <span className="text-sm font-medium text-gray-500">{stat.label}</span>
              </div>
            </div>
            <div className={`mt-2 text-2xl font-bold ${stat.color}`}>
              {isLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                `$${stat.value.toFixed(2)}`
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}