import { Calendar, Calculator, Scale, Download } from "lucide-react";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/Select";
import { Input } from "@/shared/components/Input";

type ReportType = 'profit-loss' | 'balance-sheet' | 'trial-balance';

interface ReportControlsProps {
    reportType: ReportType;
    onReportTypeChange: (type: ReportType) => void;
    selectedDateRange: string;
    onDateRangeChange: (value: string) => void;
    customDateRange: { start: string; end: string };
    onCustomDateRangeChange: (field: 'start' | 'end', value: string) => void;
    isCustomRange: boolean;
    asOfDate: string;
    onAsOfDateChange: (date: string) => void;
    onGenerate: () => void;
    onExport: () => void;
    isLoading: boolean;
    hasData: boolean;
}

export function ReportControls({
    reportType,
    onReportTypeChange,
    selectedDateRange,
    onDateRangeChange,
    customDateRange,
    onCustomDateRangeChange,
    isCustomRange,
    asOfDate,
    onAsOfDateChange,
    onGenerate,
    onExport,
    isLoading,
    hasData
}: ReportControlsProps) {
    return (
        <Card className="p-6">
            <div className="flex items-center space-x-3 mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Financial Reports</h2>
            </div>

            {/* Report Type Tabs */}
            <div className="flex space-x-1 mb-6">
                <Button
                    variant={reportType === 'profit-loss' ? 'default' : 'outline'}
                    onClick={() => onReportTypeChange('profit-loss')}
                    className="flex items-center space-x-2"
                >
                    <Calculator className="h-4 w-4" />
                    <span>Profit & Loss</span>
                </Button>
                <Button
                    variant={reportType === 'balance-sheet' ? 'default' : 'outline'}
                    onClick={() => onReportTypeChange('balance-sheet')}
                    className="flex items-center space-x-2"
                >
                    <Scale className="h-4 w-4" />
                    <span>Balance Sheet</span>
                </Button>
                <Button
                    variant={reportType === 'trial-balance' ? 'default' : 'outline'}
                    onClick={() => onReportTypeChange('trial-balance')}
                    className="flex items-center space-x-2"
                >
                    <Calculator className="h-4 w-4" />
                    <span>Trial Balance</span>
                </Button>
            </div>

            {/* Report Configuration */}
            {reportType === 'profit-loss' || reportType === 'trial-balance' ? (
                <>
                    {/* Date Range Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                            <Select value={isCustomRange ? 'custom' : selectedDateRange} onValueChange={onDateRangeChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select date range" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="lastMonth">Last Month</SelectItem>
                                    <SelectItem value="lastQuarter">Last Quarter</SelectItem>
                                    <SelectItem value="currentYear">Current Year</SelectItem>
                                    <SelectItem value="lastYear">Last Year</SelectItem>
                                    <SelectItem value="custom">Custom Range</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {isCustomRange && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                                    <Input
                                        type="date"
                                        value={customDateRange.start}
                                        onChange={(e) => onCustomDateRangeChange('start', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                                    <Input
                                        type="date"
                                        value={customDateRange.end}
                                        onChange={(e) => onCustomDateRangeChange('end', e.target.value)}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </>
            ) : (
                <>
                    {/* As of Date Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">As of Date</label>
                        <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <Input
                                type="date"
                                value={asOfDate}
                                onChange={(e) => onAsOfDateChange(e.target.value)}
                                className="w-auto"
                            />
                        </div>
                    </div>
                </>
            )}

            {/* Generate Button */}
            <div className="flex items-center space-x-3">
                <Button onClick={onGenerate} disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Generating...
                        </>
                    ) : (
                        <>
                            <Calculator className="h-4 w-4 mr-2" />
                            Generate Report
                        </>
                    )}
                </Button>
                {hasData && (
                    <Button variant="outline" onClick={onExport}>
                        <Download className="h-4 w-4 mr-2" />
                        Export to PDF
                    </Button>
                )}
            </div>
        </Card>
    );
} 