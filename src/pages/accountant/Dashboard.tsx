
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';
import {
    Users,
    FileText,
    AlertTriangle,
    CheckCircle,
    Clock,
    TrendingUp,
    DollarSign,
    Building
} from 'lucide-react';

export default function AccountantDashboard() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Accountant Dashboard</h1>
                    <p className="text-gray-600">Manage client accounts and review financial documents</p>
                </div>
                <Button>
                    <Users className="w-4 h-4 mr-2" />
                    View All Clients
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Clients</p>
                                <p className="text-2xl font-bold text-gray-900">24</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                                <Building className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                                <p className="text-2xl font-bold text-gray-900">12</p>
                            </div>
                            <div className="p-3 bg-yellow-100 rounded-full">
                                <Clock className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Completed This Month</p>
                                <p className="text-2xl font-bold text-gray-900">89</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                <p className="text-2xl font-bold text-gray-900">$45,678</p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-full">
                                <DollarSign className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity & Pending Tasks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending Document Reviews */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Pending Document Reviews
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { client: 'TechCorp Inc.', document: 'Monthly Invoice Batch', priority: 'high', time: '2 hours ago' },
                                { client: 'Green Solutions', document: 'Expense Reports', priority: 'medium', time: '4 hours ago' },
                                { client: 'StartupXYZ', document: 'Bank Statements', priority: 'low', time: '1 day ago' },
                                { client: 'Manufacturing Co.', document: 'Payroll Records', priority: 'high', time: '2 days ago' },
                            ].map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{item.client}</p>
                                        <p className="text-sm text-gray-600">{item.document}</p>
                                        <p className="text-xs text-gray-500">{item.time}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={item.priority === 'high' ? 'destructive' : item.priority === 'medium' ? 'default' : 'secondary'}>
                                            {item.priority}
                                        </Badge>
                                        <Button size="sm" variant="outline">Review</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Client Alerts */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Client Alerts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { client: 'TechCorp Inc.', alert: 'Missing quarterly tax documents', type: 'warning' },
                                { client: 'Green Solutions', alert: 'Overdue invoice payment', type: 'error' },
                                { client: 'StartupXYZ', alert: 'Account setup incomplete', type: 'info' },
                                { client: 'Manufacturing Co.', alert: 'Unusual expense pattern detected', type: 'warning' },
                            ].map((item, index) => (
                                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className={`p-1 rounded-full ${item.type === 'error' ? 'bg-red-100' :
                                        item.type === 'warning' ? 'bg-yellow-100' :
                                            'bg-blue-100'
                                        }`}>
                                        <AlertTriangle className={`w-4 h-4 ${item.type === 'error' ? 'text-red-600' :
                                            item.type === 'warning' ? 'text-yellow-600' :
                                                'text-blue-600'
                                            }`} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{item.client}</p>
                                        <p className="text-sm text-gray-600">{item.alert}</p>
                                    </div>
                                    <Button size="sm" variant="ghost">View</Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Performance */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Performance Overview
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-green-600">95%</p>
                            <p className="text-sm text-gray-600">Documents Processed On Time</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-blue-600">4.8/5</p>
                            <p className="text-sm text-gray-600">Average Client Rating</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-purple-600">156</p>
                            <p className="text-sm text-gray-600">Documents Processed This Month</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 