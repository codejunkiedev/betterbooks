import { useEffect, useState } from "react";
import { AccountingSummary, AccountingEntriesTable, StatsGrid } from "@/features/users/dashboard";
import { DashboardStats } from "@/shared/types/dashboard";
import { fetchDashboardStats } from "@/shared/services/supabase/dashboard";
import { PageSkeleton } from "@/shared/components/Loading";

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
          <PageSkeleton />
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