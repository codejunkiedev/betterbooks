import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { createCompany, updateCompany } from "@/lib/supabase/company";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { setUser } from "@/store/userSlice";
import { useState } from "react";

const ProfileSkeleton = () => (
    <div className="space-y-4 animate-pulse">
        <div className="h-10 w-full bg-gray-200 rounded" />
        <div className="h-10 w-full bg-gray-200 rounded" />
        <div className="h-12 w-full bg-gray-200 rounded" />
    </div>
);

export default function Profile() {
    const dispatch = useDispatch();
    const userState = useSelector((state: RootState) => state.user);
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        id: userState.company?.id ?? "",
        company_name: userState.company?.company_name ?? "",
        account_balance: userState.company?.account_balance?.toString() ?? ""
    });

    const handleCompanySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (!formData.company_name || !formData.account_balance) {
                toast({
                    title: "Error",
                    description: "All company fields are required.",
                    variant: "destructive",
                });
                return;
            }

            const balance = parseFloat(formData.account_balance);
            if (isNaN(balance)) {
                toast({
                    title: "Error",
                    description: "Current balance must be a valid number.",
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

            if (userState.company?.id) {
                // Update existing company
                await updateCompany(userState.company.id, {
                    company_name: formData.company_name,
                    account_balance: balance,
                });
            } else {
                // Create new company
                const newCompany = await createCompany({
                    user_id: userState.user.id,
                    company_name: formData.company_name,
                    account_balance: balance,
                });

                dispatch(setUser({
                    ...userState,
                    company: newCompany
                }));

                toast({
                    title: "Success",
                    description: "Company profile created successfully.",
                });
                return;
            }

            dispatch(setUser({
                ...userState,
                company: {
                    id: userState.company.id,
                    company_name: formData.company_name,
                    account_balance: balance
                }
            }));

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

    if (!userState.company && !userState.user) {
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
                        <div className="space-y-2">
                            <label htmlFor="currentBalance" className="text-sm font-medium">
                                Current Balance
                            </label>
                            <Input
                                id="currentBalance"
                                type="number"
                                step="0.01"
                                placeholder="Enter current balance"
                                value={formData.account_balance}
                                onChange={e => setFormData(prev => ({ ...prev, account_balance: e.target.value }))}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Saving..." : (userState.company?.id ? "Save Changes" : "Create Company Profile")}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
} 