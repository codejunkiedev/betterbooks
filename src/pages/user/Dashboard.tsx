import { useEffect, useState, memo, useCallback } from "react";
import { AccountingSummary } from "@/components/accounting/AccountingSummary";
import { AccountingEntriesTable } from "@/components/accounting/AccountingEntriesTable";
import { PageSkeleton } from "@/components/ui/loading";

const Dashboard = memo(() => {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Simulate loading time for better UX
    const timer = setTimeout(() => {
      handleLoadComplete();
    }, 100);

    return () => clearTimeout(timer);
  }, [handleLoadComplete]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      {isLoading ? (
        <PageSkeleton />
      ) : (
        <>
          <AccountingSummary />
          <div className="mt-8">
            <AccountingEntriesTable />
          </div>
        </>
      )}
    </div>
  );
});

export default Dashboard; 