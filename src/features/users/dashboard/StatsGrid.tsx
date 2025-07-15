import { FileText, Sparkles, CheckCircle } from "lucide-react";
import { DashboardStats } from "@/shared/types/dashboard";
import { Skeleton } from "@/shared/components/Loading";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/Tooltip";

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
      color: "text-gray-900",
      tooltip: "Total number of documents you've uploaded to the system"
    },
    {
      icon: <Sparkles className="h-6 w-6 text-black" />,
      label: "AI Suggestions",
      value: stats?.totalSuggestions || 0,
      color: "text-gray-900",
      tooltip: "Total number of AI-generated accounting suggestions"
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-black" />,
      label: "Approved Invoices",
      value: stats?.approvedInvoices || 0,
      color: "text-gray-900",
      tooltip: "Total number of invoices that have been approved"
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Document Statistics</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {statsData.map((stat) => (
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
                      stat.value.toLocaleString()
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
};

export default StatsGrid; 