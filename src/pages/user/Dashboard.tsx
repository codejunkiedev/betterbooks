import { FinancialSummary } from "@/features/user/dashboard/FinancialSummary";
import { AccountingSummary } from "@/features/user/dashboard/AccountingSummary";
import { AccountantQuestions } from "@/features/user/dashboard/AccountantQuestions";
import { useModules } from "@/shared/hooks/useModules";

const Dashboard = () => {
  const { hasAccounting } = useModules();
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="text-sm text-gray-500">
            Welcome back! Here's your financial overview.
          </div>
        </div>

        {/* Financial Summary Cards */}
        <FinancialSummary />

        {/* Accounting Summary */}
        {hasAccounting && <AccountingSummary />}

        {/* Questions from Accountant */}
        <AccountantQuestions />
      </div>
    </div>
  );
};

export default Dashboard; 