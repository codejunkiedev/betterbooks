import { Card, CardContent } from '@/shared/components/Card';
import { Users, Building, FileText } from 'lucide-react';
import React from 'react';

interface StatsCardsProps {
    clientsLength: number;
    clientsWithStatements: number;
    totalStatements: number;
}

const StatsCards: React.FC<StatsCardsProps> = ({ clientsLength, clientsWithStatements, totalStatements }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Total Clients</p>
                        <p className="text-2xl font-bold text-gray-900">{clientsLength}</p>
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
                        <p className="text-sm font-medium text-gray-600">Clients with Statements</p>
                        <p className="text-2xl font-bold text-gray-900">{clientsWithStatements}</p>
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
                        <p className="text-sm font-medium text-gray-600">Total Statements</p>
                        <p className="text-2xl font-bold text-gray-900">{totalStatements}</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                        <FileText className="w-6 h-6 text-purple-600" />
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
);

export default StatsCards; 