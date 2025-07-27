import { Input } from "@/shared/components/Input";
import { Button } from "@/shared/components/Button";
import { useToast } from "@/shared/hooks/useToast";
import { createCompany, updateCompany, getCompanyByUserId } from "@/shared/services/supabase/company";
import { useSelector } from "react-redux";
import { RootState } from "@/shared/services/store";
import { useState, useEffect } from "react";
import { FILING_STATUSES } from "@/shared/constants/company";

interface Company {
    id: string;
    name: string;
    type: string;
    user_id: string;
    is_active: boolean;
    created_at: string;
    tax_id_number?: string;
    filing_status?: string;
    tax_year_end?: string;
}

const ProfileSkeleton = () => (
    <div className="space-y-4 animate-pulse">
        <div className="h-10 w-full bg-gray-200 rounded" />
        <div className="h-10 w-full bg-gray-200 rounded" />
        <div className="h-12 w-full bg-gray-200 rounded" />
    </div>
);

export default function Profile() {
    const userState = useSelector((state: RootState) => state.user);
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [company, setCompany] = useState<Company | null>(null);
    const [formData, setFormData] = useState({
        company_name: "",
        tax_id_number: "",
        filing_status: "",
        tax_year_end: "",
    });

    useEffect(() => {
        const fetchCompany = async () => {
            if (userState.user?.id) {
                try {
                    const companyData = await getCompanyByUserId(userState.user.id);
                    if (companyData) {
                        setCompany(companyData);
                        setFormData({
                            company_name: companyData.name || "",
                            tax_id_number: companyData.tax_id_number || "",
                            filing_status: companyData.filing_status || "",
                            tax_year_end: companyData.tax_year_end || "",
                        });
                    }
                } catch (error) {
                    console.error("Error fetching company:", error);
                }
            }
        };

        fetchCompany();
    }, [userState.user?.id]);

    const handleCompanySubmit = async (e: React.FormEvent) => {

        e.preventDefault();
        setIsLoading(true);

        try {
            if (!formData.company_name) {
                toast({
                    title: "Error",
                    description: "Company name is required.",
                    variant: "destructive",
                });
                return;
            }

            if (!userState.user?.id) {
                toast({
                    title: "Error",
                    description: "User ID is required.",
                    variant: "destructive",
                });
                return;
            }

            if (company?.id) {
                // Update existing company
                await updateCompany(company.id, {
                    name: formData.company_name,
                    tax_id_number: formData.tax_id_number,
                    filing_status: formData.filing_status,
                    tax_year_end: formData.tax_year_end,
                });

                // Refresh company data
                const updatedCompany = await getCompanyByUserId(userState.user.id);
                setCompany(updatedCompany);
            } else {
                // Create new company
                const newCompany = await createCompany({
                    user_id: userState.user.id,
                    name: formData.company_name,
                    type: "business", // Default type
                });

                setCompany(newCompany);
                toast({
                    title: "Success",
                    description: "Company profile created successfully.",
                });
                return;
            }

            toast({
                title: "Success",
                description: "Company information updated successfully.",
            });
        } catch (error) {
            console.error("Error saving company:", error);
            toast({
                title: "Error",
                description: "Failed to save company information.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!userState.user) {
        return <ProfileSkeleton />;
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-semibold mb-2">Company & Tax Information</h2>
                <p className="text-gray-500 mb-6">
                    Manage your company and tax information
                </p>
                <div className="space-y-6 border border-gray-200 rounded-lg bg-white p-6 shadow-sm">
                    <form onSubmit={handleCompanySubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="companyName" className="text-sm font-medium">
                                Company Name
                            </label>
                            <Input
                                id="companyName"
                                placeholder="Enter your company name"
                                value={formData.company_name}
                                onChange={e => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="taxIdNumber" className="text-sm font-medium">
                                Tax ID Number
                            </label>
                            <Input
                                id="taxIdNumber"
                                placeholder="EIN, SSN, or other tax ID"
                                value={formData.tax_id_number}
                                onChange={e => setFormData(prev => ({ ...prev, tax_id_number: e.target.value }))}
                                disabled={isLoading}
                            />
                            <p className="text-xs text-gray-500">
                                Enter your Employer Identification Number (EIN), Social Security Number (SSN), or other tax identification number.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="filingStatus" className="text-sm font-medium">
                                Filing Status
                            </label>
                            <select
                                id="filingStatus"
                                value={formData.filing_status}
                                onChange={e => setFormData(prev => ({ ...prev, filing_status: e.target.value }))}
                                disabled={isLoading}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="">Select Filing Status</option>
                                {FILING_STATUSES.map(status => (
                                    <option key={status} value={status}>
                                        {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="taxYearEnd" className="text-sm font-medium">
                                Tax Year End
                            </label>
                            <Input
                                id="taxYearEnd"
                                type="date"
                                value={formData.tax_year_end}
                                onChange={e => setFormData(prev => ({ ...prev, tax_year_end: e.target.value }))}
                                disabled={isLoading}
                            />
                            <p className="text-xs text-gray-500">
                                The end date of your tax year (typically December 31st for calendar year filers).
                            </p>
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Saving..." : (company?.id ? "Save Changes" : "Create Company Profile")}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
} 