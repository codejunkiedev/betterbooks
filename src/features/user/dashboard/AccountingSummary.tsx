import { useState, useEffect, useCallback } from "react";
import { TrendingUp, TrendingDown, Scale } from "lucide-react";
import { format } from "date-fns";
import { AccountingSummaryType } from "@/shared/types/accounting";
import { fetchAccountingSummary } from "@/shared/services/supabase/accounting";
import { useToast } from "@/shared/hooks/useToast";
import { Skeleton } from "@/shared/components/Loading";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/Tooltip";
import { useAppSelector } from "@/shared/hooks/useRedux";

export function AccountingSummary() {
  const [summary, setSummary] = useState<AccountingSummaryType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAppSelector(state => state.user);

  const loadSummary = useCallback(async () => {
    // UserGuard ensures user is authenticated, so we can safely proceed
    if (!user) {
      setIsLoading(false);
      return;
    }

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
  }, [toast, user]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  // UserGuard ensures user is authenticated, so we can safely proceed
  if (!user) {
    return null;
  }

  const getPeriodLabel = () => {
    return format(new Date(), "MMMM yyyy");
  };

  const stats = [
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
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Accounting Summary</h2>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500 font-bold">{getPeriodLabel()}</span>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <TooltipProvider key={stat.label}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="bg-white p-6 rounded-lg border hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {stat.icon}
                      <span className="text-sm font-medium text-gray-500">{stat.label}</span>
                    </div>
                  </div>
                  <div className={`mt-2 text-2xl font-bold ${stat.color} transition-colors duration-200`}>
                    {isLoading ? (
                      <Skeleton className="h-8 w-32" />
                    ) : (
                      `PKR ${stat.value.toFixed(2)}`
                    )}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{stat.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  );
}