import { Card } from "@/shared/components/Card";
import { Skeleton } from "@/shared/components/Loading";

export function ReportsLoadingSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
                </div>

                {/* Report Type Selection Skeleton */}
                <Card className="p-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <Skeleton className="h-6 w-6" />
                        <Skeleton className="h-6 w-48" />
                    </div>

                    {/* Report Type Tabs Skeleton */}
                    <div className="flex space-x-1 mb-6">
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-32" />
                    </div>

                    {/* Configuration Skeleton */}
                    <div className="mb-6">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-10 w-48" />
                    </div>

                    {/* Generate Button Skeleton */}
                    <div className="flex items-center space-x-3">
                        <Skeleton className="h-10 w-40" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                </Card>

                {/* Report Content Skeleton */}
                <div className="space-y-6">
                    {/* Summary Cards Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <Card key={index} className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Skeleton className="h-4 w-24 mb-2" />
                                        <Skeleton className="h-8 w-32" />
                                    </div>
                                    <Skeleton className="h-8 w-8" />
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Section Skeleton */}
                    <Card className="p-6">
                        <div className="flex items-center mb-4">
                            <Skeleton className="h-5 w-5 mr-2" />
                            <Skeleton className="h-6 w-32" />
                        </div>
                        <div className="space-y-3">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <div key={index} className="flex items-center justify-between py-2">
                                    <Skeleton className="h-4 w-48" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
} 