import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/Card";

interface ReviewStepProps {
    companyName: string;
    companyType: string;
    skipBalance: boolean;
    cashBalance: string;
    balanceDate: string;
    skipTaxInfo: boolean;
    taxIdNumber: string;
    filingStatus: string;
    taxYearEnd: string;
}

export function ReviewStep({
    companyName,
    companyType,
    skipBalance,
    cashBalance,
    balanceDate,
    skipTaxInfo,
    taxIdNumber,
    filingStatus,
    taxYearEnd
}: ReviewStepProps) {
    const formatCompanyType = (type: string) => {
        return type
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    const getBalanceDisplay = () => {
        if (skipBalance) {
            return "Skipped (will be set to $0.00)";
        }
        return `$${parseFloat(cashBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })} as of ${new Date(balanceDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`;
    };

    const getTaxInfoDisplay = () => {
        if (skipTaxInfo) {
            return "Skipped (can be added later)";
        }
        const parts = [];
        if (taxIdNumber) parts.push(`Tax ID: ${taxIdNumber}`);
        if (filingStatus) parts.push(`Filing Status: ${filingStatus.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}`);
        if (taxYearEnd) parts.push(`Tax Year End: ${new Date(taxYearEnd).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`);
        return parts.length > 0 ? parts.join(', ') : "Not provided";
    };

    return (
        <Card className="shadow-lg border-0">
            <CardHeader>
                <CardTitle>Review & Complete</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-3">Summary</h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="font-medium">Company Name:</span>
                            <span>{companyName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Company Type:</span>
                            <span>{formatCompanyType(companyType)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Opening Balance:</span>
                            <span>{getBalanceDisplay()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Tax Information:</span>
                            <span>{getTaxInfoDisplay()}</span>
                        </div>
                    </div>
                </div>

                <p className="text-gray-600 text-sm">
                    Click below to complete your company setup.
                </p>
            </CardContent>
        </Card>
    );
} 