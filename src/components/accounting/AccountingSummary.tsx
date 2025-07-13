import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { TrendingUp, TrendingDown, Scale } from "lucide-react";
import { format } from "date-fns";
import { AccountingSummaryType } from "@/interfaces/accounting";
import { fetchAccountingSummary } from "@/lib/supabase/accounting";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/loading";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Memoized stat card component
const StatCard = memo(({
  icon,
  label,
  value,
  color,
  tooltip,
  isLoading
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  tooltip: string;
  isLoading: boolean;
}) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="bg-white p-6 rounded-lg border hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {icon}
              <span className="text-sm font-medium text-gray-500">{label}</span>
            </div>
          </div>
          <div className={`mt-2 text-2xl font-bold ${color} transition-colors duration-200`}>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              `PKR ${value.toFixed(2)}`
            )}
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
));

// Memoized period label component
const PeriodLabel = memo(() => {
  const periodLabel = useMemo(() => format(new Date(), "MMMM yyyy"), []);
  return (
    <span className="text-sm text-gray-500 font-bold">{periodLabel}</span>
  );
});

export function AccountingSummary() {
  const [summary, setSummary] = useState<AccountingSummaryType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadSummary = useCallback(async () => {
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
  }, [toast]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  // Memoized stats configuration
  const stats = useMemo(() => [
    {
      icon: <TrendingDown className="h-6 w-6 text-black" />,
      label: "Total Debits",
      value: summary?.totalDebits || 0,
      color: "text-gray-900",
      tooltip: "Total amount of money coming into your account"
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-black" />,
      label: "Total Credits",
      value: summary?.totalCredits || 0,
      color: "text-gray-900",
      tooltip: "Total amount of money going out of your account"
    },
    {
      icon: <Scale className="h-6 w-6 text-black" />,
      label: "Net Balance",
      value: summary?.netBalance || 0,
      color: (summary?.netBalance ?? 0) >= 0 ? "text-green-600" : "text-red-600",
      tooltip: "Current balance in your account"
    }
  ], [summary]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Accounting Summary</h2>
        <div className="flex items-center space-x-4">
          <PeriodLabel />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            color={stat.color}
            tooltip={stat.tooltip}
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  );
}