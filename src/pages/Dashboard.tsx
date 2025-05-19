import { Button } from "@/components/ui/button";
import { Sparkles, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { fetchInvoiceSuggestions } from "@/lib/supabase/suggestion";
import { Loader2 } from "lucide-react";
import { AccountingSummary } from "@/components/accounting/AccountingSummary";
import { AccountingEntriesTable } from "@/components/accounting/AccountingEntriesTable";
import StatsGrid from "@/components/dashboard/StatsGrid";
import RecentInvoicesTable from "@/components/dashboard/RecentInvoicesTable";
import { DashboardStats } from "@/interfaces/dashboard";
import { fetchDashboardStats } from "@/lib/supabase/dashboard";

const DashboardSkeleton = () => {
  return (
    <div className="space-y-8">
      {/* Accounting Summary Skeleton */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="h-6 w-48 bg-gray-100 rounded animate-pulse mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border border-gray-200 rounded-lg">
              <div className="h-4 w-24 bg-gray-100 rounded animate-pulse mb-2" />
              <div className="h-8 w-32 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-5 rounded-lg border border-gray-200">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-gray-100 rounded-lg w-10 h-10 animate-pulse" />
              <div className="flex-1">
                <div className="h-4 w-32 bg-gray-100 rounded animate-pulse mb-2" />
                <div className="h-6 w-20 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Accounting Entries Table Skeleton */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="h-6 w-48 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data, error } = await fetchDashboardStats();
        if (error) {
          console.error("Error fetching dashboard stats:", error);
        } else {
          setStats(data);
        }
      } catch (error) {
        console.error("Error loading dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        {isLoading ? (
          <DashboardSkeleton />
        ) : (
          <>
            <AccountingSummary />
            <div className="mt-8">
              <StatsGrid stats={stats} isLoading={false} />
            </div>
            <div className="mt-8">
              <AccountingEntriesTable />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 