import { memo, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageSkeleton } from "@/components/ui/loading";
import {
    Users,
    UserCheck,
    Building,
    FileText,
    TrendingUp,
    AlertTriangle,
    Settings,
    Shield,
    Activity
} from "lucide-react";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { ACTIVITY_MESSAGES, QUICK_ACTIONS } from "@/constants";
import { ActivityType } from "@/types";

// Memoized activity icon component
const ActivityIcon = memo(({ activity }: { activity: ActivityType }) => {
    const icon = useMemo(() => {
        switch (activity) {
            case ActivityType.USER_LOGIN:
                return <Users className="w-4 h-4" />;
            case ActivityType.DOCUMENT_UPLOADED:
                return <FileText className="w-4 h-4" />;
            case ActivityType.JOURNAL_ENTRY_CREATED:
                return <Activity className="w-4 h-4" />;
            case ActivityType.COMPANY_ACTIVATED:
                return <Building className="w-4 h-4" />;
            case ActivityType.COMPANY_DEACTIVATED:
                return <AlertTriangle className="w-4 h-4" />;
            default:
                return <Activity className="w-4 h-4" />;
        }
    }, [activity]);

    return icon;
});

// Memoized stats card component
const StatsCard = memo(({
    title,
    value,
    icon,
    description,
    trend
}: {
    title: string;
    value: number;
    icon: React.ReactNode;
    description?: string;
    trend?: string;
}) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            {trend && (
                <p className="text-xs text-muted-foreground">
                    <TrendingUp className="inline w-3 h-3 mr-1" />
                    {trend}
                </p>
            )}
            {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
            )}
        </CardContent>
    </Card>
));

// Memoized activity item component
const ActivityItem = memo(({
    activity,
    actor_name,
    company_name,
    created_at
}: {
    activity: ActivityType;
    actor_name: string;
    company_name?: string;
    created_at: string;
}) => {
    const formattedDate = useMemo(() => {
        return new Date(created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }, [created_at]);

    const activityMessage = ACTIVITY_MESSAGES[activity];

    return (
        <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
                <ActivityIcon activity={activity} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                    {actor_name} {activityMessage?.title.toLowerCase()}
                </p>
                {company_name && (
                    <p className="text-sm text-gray-500 truncate">
                        {company_name}
                    </p>
                )}
            </div>
            <div className="flex-shrink-0 text-sm text-gray-500">
                {formattedDate}
            </div>
        </div>
    );
});

const AdminDashboard = memo(() => {
    const { stats, recentActivity, isLoading } = useAdminDashboard();

    // Memoized stats cards data
    const statsCards = useMemo(() => [
        {
            title: "Total Users",
            value: stats?.total_users || 0,
            icon: <Users className="h-4 w-4 text-muted-foreground" />,
            trend: `+${stats?.monthly_growth || 0}% this month`
        },
        {
            title: "Accountants",
            value: stats?.total_accountants || 0,
            icon: <UserCheck className="h-4 w-4 text-muted-foreground" />,
            description: "Active service providers"
        },
        {
            title: "Companies",
            value: stats?.total_companies || 0,
            icon: <Building className="h-4 w-4 text-muted-foreground" />,
            description: `${stats?.active_companies || 0} active, ${stats?.inactive_companies || 0} inactive`
        },
        {
            title: "Documents",
            value: stats?.total_documents || 0,
            icon: <FileText className="h-4 w-4 text-muted-foreground" />,
            description: `${stats?.pending_documents || 0} pending review`
        }
    ], [stats]);

    if (isLoading) {
        return <PageSkeleton />;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-gray-600 mt-2">System overview and platform management</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Settings className="w-4 h-4 mr-2" />
                            System Settings
                        </Button>
                        <Button>
                            <Shield className="w-4 h-4 mr-2" />
                            Security Center
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statsCards.map((card) => (
                        <StatsCard key={card.title} {...card} />
                    ))}
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>
                                Latest system activities and user actions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentActivity.length === 0 ? (
                                    <p className="text-sm text-gray-500 text-center py-4">
                                        No recent activity
                                    </p>
                                ) : (
                                    recentActivity.map((activity) => (
                                        <ActivityItem
                                            key={activity.id}
                                            activity={activity.activity as ActivityType}
                                            actor_name={activity.actor_name}
                                            company_name={activity.company_name}
                                            created_at={activity.created_at}
                                        />
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>
                                Common administrative tasks
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {QUICK_ACTIONS.ADMIN.map((action) => (
                                    <Button key={action.action} variant="outline" className="w-full justify-start">
                                        <action.icon className="w-4 h-4 mr-2" />
                                        {action.label}
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
});

export default AdminDashboard; 