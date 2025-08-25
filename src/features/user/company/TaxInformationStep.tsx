import { Input } from "@/shared/components/Input";
import { Button } from "@/shared/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/Card";
import { FILING_STATUSES } from "@/shared/constants/company";

// eslint-disable-next-line react-refresh/only-export-components
export function validateTaxInformation(
    taxIdNumber: string,
    filingStatus: string,
    taxYearEnd: string,
    skipTaxInfo: boolean
): boolean {
    if (skipTaxInfo) {
        return true; // Skip is always valid
    }

    // If not skipping, all fields are optional but if provided should be valid
    if (taxIdNumber && taxIdNumber.trim().length === 0) {
        return false;
    }

    if (filingStatus && filingStatus.trim().length === 0) {
        return false;
    }

    if (taxYearEnd) {
        const date = new Date(taxYearEnd);
        if (isNaN(date.getTime())) {
            return false;
        }
    }

    return true;
}

interface TaxInformationStepProps {
    taxIdNumber: string;
    filingStatus: string;
    taxYearEnd: string;
    skipTaxInfo: boolean;
    onFieldChange: (field: string, value: string) => void;
    onSkipTaxInfo: () => void;
    onAddTaxInfo: () => void;
    isLoading: boolean;
}

export function TaxInformationStep({
    taxIdNumber,
    filingStatus,
    taxYearEnd,
    skipTaxInfo,
    onFieldChange,
    onSkipTaxInfo,
    onAddTaxInfo,
    isLoading
}: TaxInformationStepProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        onFieldChange(e.target.name, e.target.value);
    };

    const formatFilingStatus = (status: string) => {
        return status
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    if (skipTaxInfo) {
        return (
            <Card className="shadow-lg border-0">
                <CardHeader>
                    <CardTitle>Tax Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-gray-600 text-sm">
                        Set up your company's tax information. You can skip this step and complete it later from your profile settings.
                    </p>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">
                            Tax information will be added later. You can complete this information from your profile settings.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onAddTaxInfo}
                            disabled={isLoading}
                            className="flex-1"
                        >
                            Add Tax Information
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-lg border-0">
            <CardHeader>
                <CardTitle>Tax Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm">
                    Set up your company's tax information. You can skip this step and complete it later from your profile settings.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label htmlFor="tax_id_number" className="text-sm font-medium">
                            Tax ID Number
                        </label>
                        <Input
                            id="tax_id_number"
                            name="tax_id_number"
                            placeholder="EIN, SSN, or other tax ID"
                            value={taxIdNumber}
                            onChange={handleChange}
                            disabled={isLoading}
                            className="w-full"
                        />
                        <p className="text-xs text-gray-500">
                            Enter your Employer Identification Number (EIN), Social Security Number (SSN), or other tax identification number.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="filing_status" className="text-sm font-medium">
                            Filing Status
                        </label>
                        <select
                            id="filing_status"
                            name="filing_status"
                            value={filingStatus}
                            onChange={handleChange}
                            disabled={isLoading}
                            className="w-full appearance-none px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                        >
                            <option value="">Select Filing Status</option>
                            {FILING_STATUSES.map(status => (
                                <option key={status} value={status}>
                                    {formatFilingStatus(status)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="tax_year_end" className="text-sm font-medium">
                        Tax Year End
                    </label>
                    <input
                        id="tax_year_end"
                        name="tax_year_end"
                        type="date"
                        value={taxYearEnd}
                        onChange={handleChange}
                        disabled={isLoading}
                        className="w-full appearance-none px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                    />
                    <p className="text-xs text-gray-500">
                        The end date of your tax year (typically December 31st for calendar year filers).
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onSkipTaxInfo}
                        disabled={isLoading}
                        className="flex-1"
                    >
                        Skip Tax Information
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
} 