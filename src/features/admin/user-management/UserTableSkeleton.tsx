import { Skeleton } from '@/shared/components/Loading';

export const UserTableSkeleton = () => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b">
                        <th className="text-left p-4"><Skeleton className="h-4 w-24" /></th>
                        <th className="text-left p-4"><Skeleton className="h-4 w-32" /></th>
                        <th className="text-left p-4"><Skeleton className="h-4 w-28" /></th>
                        <th className="text-left p-4"><Skeleton className="h-4 w-24" /></th>
                        <th className="text-left p-4"><Skeleton className="h-4 w-32" /></th>
                        <th className="text-left p-4"><Skeleton className="h-4 w-16" /></th>
                        <th className="text-left p-4"><Skeleton className="h-4 w-36" /></th>
                        <th className="text-left p-4"><Skeleton className="h-4 w-24" /></th>
                        <th className="text-left p-4"><Skeleton className="h-4 w-20" /></th>
                        <th className="text-left p-4"><Skeleton className="h-4 w-16" /></th>
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: 5 }).map((_, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-4"><Skeleton className="h-4 w-32" /></td>
                            <td className="p-4"><Skeleton className="h-4 w-28" /></td>
                            <td className="p-4"><Skeleton className="h-4 w-40" /></td>
                            <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                            <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                            <td className="p-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                            <td className="p-4"><Skeleton className="h-4 w-28" /></td>
                            <td className="p-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                            <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                            <td className="p-4"><Skeleton className="h-8 w-8 rounded" /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}; 