import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OpeningBalanceStepProps {
    cashBalance: string;
    balanceDate: string;
    skipBalance: boolean;
    onFieldChange: (field: string, value: string) => void;
    onSkipBalance: () => void;
    onAddBalance: () => void;
    isLoading: boolean;
}

export function OpeningBalanceStep({
    cashBalance,
    balanceDate,
    skipBalance,
    onFieldChange,
    onSkipBalance,
    onAddBalance,
    isLoading
}: OpeningBalanceStepProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Map form field names to hook field names
        const fieldMap: Record<string, string> = {
            'cash_balance': 'openingBalance',
            'balance_date': 'openingBalanceDate'
        };

        const fieldName = fieldMap[e.target.name] || e.target.name;
        const value = e.target.value;

        // Convert cash balance to number if it's a valid number
        if (fieldName === 'openingBalance') {
            if (value === '') {
                onFieldChange(fieldName, '');
                return;
            }
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
                onFieldChange(fieldName, numValue.toString());
                return;
            }
        }

        // For date field, just pass the string value as-is
        // The conversion to Date object will be handled in the parent component
        if (fieldName === 'openingBalanceDate') {
            onFieldChange(fieldName, value);
            return;
        }

        onFieldChange(fieldName, value);
    };

    return (
        <Card className="shadow-lg border-0">
            <CardHeader>
                <CardTitle>Opening Balance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm">
                    Set up your company's opening cash balance. You can skip this step if you don't have an opening balance.
                </p>

                {!skipBalance && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="cash_balance" className="text-sm font-medium">
                                Cash Balance
                            </label>
                            <Input
                                id="cash_balance"
                                name="cash_balance"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={cashBalance}
                                onChange={handleChange}
                                disabled={isLoading}
                                className="w-full"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="balance_date" className="text-sm font-medium">
                                Date
                            </label>
                            <Input
                                id="balance_date"
                                name="balance_date"
                                type="date"
                                value={balanceDate}
                                onChange={handleChange}
                                disabled={isLoading}
                                className="w-full"
                            />
                        </div>
                    </div>
                )}

                {skipBalance && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">
                            Opening balance will be set to $0.00. You can add transactions later.
                        </p>
                    </div>
                )}

                <div className="flex gap-2">
                    {!skipBalance ? (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onSkipBalance}
                            disabled={isLoading}
                            className="flex-1"
                        >
                            Skip Opening Balance
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onAddBalance}
                            disabled={isLoading}
                            className="flex-1"
                        >
                            Add Opening Balance
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
} 