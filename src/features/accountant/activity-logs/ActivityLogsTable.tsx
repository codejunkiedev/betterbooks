import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/Table";
import { Badge } from "@/shared/components/Badge";
import { Button } from "@/shared/components/Button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { ActivityLog, ActivityType } from "@/shared/types/activity";
import React from "react";

interface ActivityLogsTableProps {
    activityLogs: ActivityLog[];
    loading: boolean;
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    setCurrentPage: (page: number) => void;
    activityTypeLabels: Record<ActivityType, string>;
    activityTypeColors: Record<ActivityType, string>;
    getActivityDescription: (log: ActivityLog) => string;
}

export const ActivityLogsTable: React.FC<ActivityLogsTableProps> = ({
    activityLogs,
    loading,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    setCurrentPage,
    activityTypeLabels,
    activityTypeColors,
    getActivityDescription,
}) => {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">Loading activity logs...</div>
            </div>
        );
    }

    if (activityLogs.length === 0) {
        return (
            <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No activity logs found</h3>
                <p className="text-gray-600">
                    No activities have been logged yet.
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Timestamp</TableHead>
                            <TableHead>Activity</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Description</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {activityLogs.map((log) => (
                            <TableRow key={log.id}>
                                <TableCell className="font-mono text-sm">
                                    {log.created_at ? new Date(log.created_at).toLocaleString() : ""}
                                </TableCell>
                                <TableCell>
                                    <Badge className={activityTypeColors[log.activity]}>
                                        {activityTypeLabels[log.activity]}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div>
                                        <div className="font-medium">
                                            {log.actor_name || "Unknown User"}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {log.actor_email || "No email"}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="font-medium">
                                        {log.company_name || "Unknown Company"}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm text-gray-700">
                                        {getActivityDescription(log)}
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            {activityLogs.length > 0 && totalItems > 0 && (
                <div className="mt-6 flex items-center justify-between px-2">
                    <div className="text-sm text-gray-500">
                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} activities
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="text-sm text-gray-500">
                            Page {currentPage} of {totalPages}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
}; 