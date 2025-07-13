import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { COMPANY_TYPES } from "@/constants/company";

interface CompanyInfoStepProps {
    companyName: string;
    companyType: string;
    onFieldChange: (field: string, value: string) => void;
    isLoading: boolean;
}

export function CompanyInfoStep({
    companyName,
    companyType,
    onFieldChange,
    isLoading
}: CompanyInfoStepProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        onFieldChange(e.target.name, e.target.value);
    };

    const formatCompanyType = (type: string) => {
        return type
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    return (
        <Card className="shadow-lg border-0">
            <CardHeader>
                <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <label htmlFor="company_name" className="text-sm font-medium">
                        Company Name
                    </label>
                    <Input
                        id="company_name"
                        name="company_name"
                        placeholder="Enter your company name"
                        value={companyName}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="company_type" className="text-sm font-medium">
                        Company Type
                    </label>
                    <select
                        id="company_type"
                        name="company_type"
                        value={companyType}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="">Select Company Type</option>
                        {COMPANY_TYPES.map(type => (
                            <option key={type} value={type}>
                                {formatCompanyType(type)}
                            </option>
                        ))}
                    </select>
                </div>
            </CardContent>
        </Card>
    );
} 