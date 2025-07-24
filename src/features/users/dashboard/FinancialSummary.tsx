import { useState, useEffect, useCallback } from "react";
import { TrendingUp, TrendingDown, DollarSign, PiggyBank } from "lucide-react";
import { format } from "date-fns";
import { fetchFinancialMetrics } from "@/shared/services/supabase/accounting";
import { useToast } from "@/shared/hooks/useToast";
import { Skeleton } from "@/shared/components/Loading";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/shared/components/Tooltip";
import { Button } from "@/shared/components/Button";

interface FinancialMetrics {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    cashBalance: number;
    period: {
        start: string;
        end: string;
    };
}

export function FinancialSummary() {
    const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [period, setPeriod] = useState<'month' | 'quarter'>('month');
    const { toast } = useToast();

    const loadMetrics = useCallback(async () => {
        try {
            setIsLoading(true);
            const { data, error } = await fetchFinancialMetrics(period);
            if (error) throw error;
            setMetrics(data);
        } catch (error: unknown) {
            console.error("Error fetching financial metrics:", error);
            toast({
                title: "Error",
                description: "Failed to load financial metrics. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [period, toast]);

    useEffect(() => {
        loadMetrics();
    }, [loadMetrics]);

    const getPeriodLabel = () => {
        if (!metrics) return "";
        const startDate = new Date(metrics.period.start);
        const endDate = new Date(metrics.period.end);

        if (period === 'month') {
            return format(startDate, "MMMM yyyy");
        } else {
            return `${format(startDate, "MMM yyyy")} - ${format(endDate, "MMM yyyy")}`;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const stats = [
        {
            icon: <TrendingUp className="h-6 w-6 text-green-600" />,
            label: "Total Revenue",
            value: metrics?.totalRevenue || 0,
            color: "text-green-600",
            tooltip: "Total income from sales and services"
        },
        {
            icon: <TrendingDown className="h-6 w-6 text-red-600" />,
            label: "Total Expenses",
            value: metrics?.totalExpenses || 0,
            color: "text-red-600",
            tooltip: "Total costs and expenses incurred"
        },
        {
            icon: <DollarSign className="h-6 w-6 text-blue-600" />,
            label: "Net Profit",
            value: metrics?.netProfit || 0,
            color: (metrics?.netProfit ?? 0) >= 0 ? "text-blue-600" : "text-red-600",
            tooltip: "Revenue minus expenses (profit or loss)"
        },
        {
            icon: <PiggyBank className="h-6 w-6 text-purple-600" />,
            label: "Cash Balance",
            value: metrics?.cashBalance || 0,
            color: (metrics?.cashBalance ?? 0) >= 0 ? "text-purple-600" : "text-red-600",
            tooltip: "Current cash and bank account balance"
        }
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Financial Summary</h2>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <Button
                            variant={period === 'month' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPeriod('month')}
                        >
                            Month
                        </Button>
                        <Button
                            variant={period === 'quarter' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPeriod('quarter')}
                        >
                            Quarter
                        </Button>
                    </div>
                    <span className="text-sm text-gray-500 font-bold">{getPeriodLabel()}</span>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                                            formatCurrency(stat.value)
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