import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReviewStepProps {
    companyName: string;
    companyType: string;
    skipBalance: boolean;
    cashBalance: string;
    balanceDate: string;
}

export function ReviewStep({
    companyName,
    companyType,
    skipBalance,
    cashBalance,
    balanceDate
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

        const amount = parseFloat(cashBalance);
        if (isNaN(amount)) {
            return "Invalid amount";
        }

        let dateDisplay = "";
        if (balanceDate) {
            try {
                const date = new Date(balanceDate);
                if (!isNaN(date.getTime())) {
                    dateDisplay = ` as of ${date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}`;
                }
            } catch {
                dateDisplay = "";
            }
        }

        return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}${dateDisplay}`;
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
                    </div>
                </div>

                <p className="text-gray-600 text-sm">
                    Click the button below to complete your company setup. All information will be saved to your account.
                </p>
            </CardContent>
        </Card>
    );
} 