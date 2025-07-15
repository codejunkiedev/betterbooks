
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';
import {
    Users,
    Building,
    FileText,
    TrendingUp,
    DollarSign,
    Activity,
    AlertTriangle,
    CheckCircle,
    Clock,
    BarChart3,
    Settings
} from 'lucide-react';

export default function AdminDashboard() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600">System overview and platform management</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                    </Button>
                    <Button>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Analytics
                    </Button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Users</p>
                                <p className="text-2xl font-bold text-gray-900">2,847</p>
                                <p className="text-sm text-green-600">+12% from last month</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Companies</p>
                                <p className="text-2xl font-bold text-gray-900">1,234</p>
                                <p className="text-sm text-green-600">+8% from last month</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <Building className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Documents Processed</p>
                                <p className="text-2xl font-bold text-gray-900">45,678</p>
                                <p className="text-sm text-green-600">+24% from last month</p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-full">
                                <FileText className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                                <p className="text-2xl font-bold text-gray-900">$89,456</p>
                                <p className="text-sm text-green-600">+15% from last month</p>
                            </div>
                            <div className="p-3 bg-yellow-100 rounded-full">
                                <DollarSign className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* System Health & Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* System Health */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5" />
                            System Health
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="p-1 bg-green-100 rounded-full">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">API Services</p>
                                        <p className="text-sm text-gray-600">All systems operational</p>
                                    </div>
                                </div>
                                <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="p-1 bg-green-100 rounded-full">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Database</p>
                                        <p className="text-sm text-gray-600">Response time: 45ms</p>
                                    </div>
                                </div>
                                <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="p-1 bg-yellow-100 rounded-full">
                                        <Clock className="w-4 h-4 text-yellow-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">File Storage</p>
                                        <p className="text-sm text-gray-600">85% capacity used</p>
                                    </div>
                                </div>
                                <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="p-1 bg-green-100 rounded-full">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Security</p>
                                        <p className="text-sm text-gray-600">No security incidents</p>
                                    </div>
                                </div>
                                <Badge className="bg-green-100 text-green-800">Secure</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Alerts */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Recent Alerts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                {
                                    type: 'warning',
                                    title: 'High CPU Usage',
                                    description: 'Server load at 85%',
                                    time: '5 minutes ago',
                                    severity: 'medium'
                                },
                                {
                                    type: 'info',
                                    title: 'New User Registration',
                                    description: '15 new users in the last hour',
                                    time: '12 minutes ago',
                                    severity: 'low'
                                },
                                {
                                    type: 'error',
                                    title: 'Failed Payment',
                                    description: 'Payment processing error for TechCorp',
                                    time: '1 hour ago',
                                    severity: 'high'
                                },
                                {
                                    type: 'success',
                                    title: 'Backup Completed',
                                    description: 'Daily backup completed successfully',
                                    time: '2 hours ago',
                                    severity: 'low'
                                },
                            ].map((alert, index) => (
                                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className={`p-1 rounded-full ${alert.type === 'error' ? 'bg-red-100' :
                                        alert.type === 'warning' ? 'bg-yellow-100' :
                                            alert.type === 'success' ? 'bg-green-100' :
                                                'bg-blue-100'
                                        }`}>
                                        <AlertTriangle className={`w-4 h-4 ${alert.type === 'error' ? 'text-red-600' :
                                            alert.type === 'warning' ? 'text-yellow-600' :
                                                alert.type === 'success' ? 'text-green-600' :
                                                    'text-blue-600'
                                            }`} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-medium text-gray-900">{alert.title}</p>
                                                <p className="text-sm text-gray-600">{alert.description}</p>
                                                <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                                            </div>
                                            <Badge variant={alert.severity === 'high' ? 'destructive' : alert.severity === 'medium' ? 'default' : 'secondary'}>
                                                {alert.severity}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* User Management & Platform Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent User Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Recent User Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { action: 'New user registration', user: 'john.doe@company.com', time: '2 minutes ago' },
                                { action: 'Document uploaded', user: 'jane.smith@techcorp.com', time: '5 minutes ago' },
                                { action: 'Company setup completed', user: 'admin@startup.com', time: '12 minutes ago' },
                                { action: 'Invoice processed', user: 'finance@manufacturing.com', time: '18 minutes ago' },
                                { action: 'User role updated', user: 'accountant@firm.com', time: '25 minutes ago' },
                            ].map((activity, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="p-2 bg-blue-100 rounded-full">
                                        <Activity className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{activity.action}</p>
                                        <p className="text-sm text-gray-600">{activity.user}</p>
                                        <p className="text-xs text-gray-500">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Platform Statistics */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            Platform Statistics
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-blue-600">98.9%</p>
                                <p className="text-sm text-gray-600">System Uptime</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-600">4.8/5</p>
                                <p className="text-sm text-gray-600">User Satisfaction</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-purple-600">156ms</p>
                                <p className="text-sm text-gray-600">Avg Response Time</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-yellow-600">24/7</p>
                                <p className="text-sm text-gray-600">Support Coverage</p>
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Storage Used</span>
                                <span className="text-sm font-medium">2.4TB / 5TB</span>
                            </div>
                            <div className="mt-2 bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '48%' }}></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 