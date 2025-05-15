import { useState, useEffect } from "react";
// import { fetchDashboardStats, DashboardStats } from "@/lib/supabase/suggestion";
import StatsGrid from "@/components/dashboard/StatsGrid";
import RecentInvoicesTable from "@/components/dashboard/RecentInvoicesTable";
import { DashboardStats } from "@/interfaces/dashboard";
import { fetchDashboardStats } from "@/lib/supabase/dashboard";

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
        <StatsGrid stats={stats} isLoading={isLoading} />
        <RecentInvoicesTable />
      </div>
    </div>
  );
};

export default Dashboard; 