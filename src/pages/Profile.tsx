import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { createCompany, updateCompany, getCompanyByUserId } from "@/lib/supabase/company";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useState, useEffect } from "react";

interface Company {
    id: string;
    name: string;
    type: string;
    user_id: string;
    is_active: boolean;
    created_at: string;
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
                <h2 className="text-2xl font-semibold mb-2">Company Information</h2>
                <p className="text-gray-500 mb-6">
                    Set up your company information
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
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Saving..." : (company?.id ? "Save Changes" : "Create Company Profile")}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
} 