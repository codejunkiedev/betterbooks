import { FileText, Sparkles, CheckCircle } from "lucide-react";
import { DashboardStats } from "@/interfaces/dashboard";
import { Skeleton } from "@/components/ui/loading";

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
      color: "text-gray-900"
    },
    {
      icon: <Sparkles className="h-6 w-6 text-black" />,
      label: "AI Suggestions",
      value: stats?.totalSuggestions || 0,
      color: "text-gray-900"
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-black" />,
      label: "Approved Invoices",
      value: stats?.approvedInvoices || 0,
      color: "text-gray-900"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {statsData.map((stat) => (
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
              stat.value.toLocaleString()
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid; 