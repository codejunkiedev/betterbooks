import { FileText, Sparkles, BarChart } from "lucide-react";
import StatsCard from "./StatsCard";
import { DashboardStats } from "@/interfaces/dashboard";

interface StatsGridProps {
  stats: DashboardStats | null;
  isLoading: boolean;
}

const StatsGrid = ({ stats, isLoading }: StatsGridProps) => {
  const statsData = [
    {
      icon: <FileText className="h-6 w-6 text-black" />,
      label: "Documents Uploaded",
      value: stats?.totalDocuments || 0,
    },
    {
      icon: <Sparkles className="h-6 w-6 text-black" />,
      label: "AI Suggestions",
      value: stats?.totalSuggestions || 0,
    },
    {
      icon: <BarChart className="h-6 w-6 text-black" />,
      label: "Approved Invoices",
      value: stats?.approvedInvoices || 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {statsData.map((stat, index) => (
        <StatsCard
          key={index}
          icon={stat.icon}
          label={stat.label}
          value={stat.value}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
};

export default StatsGrid; 