import { Input } from "@/shared/components/Input";
import { Button } from "@/shared/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/Card";

interface OpeningBalanceStepProps {
    cashBalance: string;
    balanceDate: string;
    skipBalance: boolean;
    onFieldChange: (field: string, value: string) => void;
    onSkipBalance: () => void;
    onAddBalance: () => void;
    isLoading: boolean;
}

// eslint-disable-next-line react-refresh/only-export-components
export const validateOpeningBalance = (cashBalance: string, balanceDate: string, skipBalance: boolean): boolean => {
    if (skipBalance) return true;

    if (!cashBalance || !balanceDate) return false;

    const amount = parseFloat(cashBalance);
    const date = new Date(balanceDate);
    const today = new Date();

    return amount > 0 && date <= today;
};

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
        const value = e.target.value;

        // For cash balance field, prevent negative values
        if (e.target.name === 'cash_balance') {
            const numValue = parseFloat(value);
            if (numValue < 0) {
                return; // Don't update if negative
            }
        }

        onFieldChange(e.target.name, value);
    };



    const getValidationMessage = () => {
        if (skipBalance) return null;

        if (!cashBalance || !balanceDate) {
            if (!cashBalance && !balanceDate) {
                return "Please enter both cash balance and date";
            }
            if (!cashBalance) {
                return "Please enter cash balance";
            }
            if (!balanceDate) {
                return "Please select a date";
            }
        }

        const amount = parseFloat(cashBalance);
        const date = new Date(balanceDate);
        const today = new Date();

        if (amount < 0) {
            return "Opening balance cannot be negative";
        }
        if (amount === 0 && cashBalance) {
            return "Opening balance must be greater than 0";
        }
        if (date > today) {
            return "Opening balance date cannot be in the future";
        }
        return null;
    };

    const validationMessage = getValidationMessage();

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
                            <input
                                id="balance_date"
                                name="balance_date"
                                type="date"
                                value={balanceDate}
                                onChange={handleChange}
                                disabled={isLoading}
                                className="w-full appearance-none px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                            />
                        </div>
                    </div>
                )}

                {validationMessage && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                        <p className="text-sm text-red-600">{validationMessage}</p>
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