interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  isLoading?: boolean;
}

const StatsCard = ({ icon, label, value, isLoading = false }: StatsCardProps) => {
  return (
    <div className="bg-white p-5 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200">
      <div className="flex items-start gap-4">
        <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-100">
          <div className="text-blue-600 w-5 h-5">
            {icon}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-600 truncate">{label}</p>
          <p className="text-xl font-semibold text-gray-900 mt-1">
            {isLoading ? (
              <div className="h-6 w-20 bg-gray-100 rounded animate-pulse" />
            ) : (
              value.toLocaleString()
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatsCard; 