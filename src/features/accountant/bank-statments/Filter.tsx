import { Input } from '@/shared/components/Input';
import { Card, CardContent } from '@/shared/components/Card';
import { Search } from 'lucide-react';
import React from 'react';

interface FilterProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
}

const Filter: React.FC<FilterProps> = ({ searchTerm, setSearchTerm }) => (
    <Card>
        <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Search clients..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
);

export default Filter; 