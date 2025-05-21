import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Company } from "@/interfaces/profile";

export default function Profile() {
    // Company Information State
    const [companyName, setCompanyName] = useState("");
    const [currentBalance, setCurrentBalance] = useState("");
    const [companyLoading, setCompanyLoading] = useState(false);
    const [company, setCompany] = useState<Company | null>(null);

    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        // if (!user) {
        //     navigate("/login");
        //     return;
        // }
        fetchCompany();
    }, [user, navigate]);

    const fetchCompany = async () => {
        try {
            const { data, error } = await supabase
                .from("company")
                .select("*")
                .eq("user_id", user?.id)
                .single();

            if (error) {
                if (error.code !== "PGRST116") {
                    console.error("Error fetching company:", error);
                }
                return;
            }

            // if (data) {
            //     // If company exists, redirect to dashboard
            //     navigate("/");
            //     return;
            // }

            setCompany(data);
            setCompanyName(data?.company_name || "");
            setCurrentBalance(data?.account_balance?.toString() || "");
        } catch (error) {
            console.error("Error fetching company:", error);
        }
    };

    const handleCompanySubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast({
                title: "Error",
                description: "You must be logged in to create a company.",
                variant: "destructive",
            });
            navigate("/login");
            return;
        }

        if (!companyName || !currentBalance) {
            toast({
                title: "Error",
                description: "All company fields are required.",
                variant: "destructive",
            });
            return;
        }

        const balance = parseFloat(currentBalance);
        if (isNaN(balance)) {
            toast({
                title: "Error",
                description: "Current balance must be a valid number.",
                variant: "destructive",
            });
            return;
        }

        setCompanyLoading(true);

        try {
            // Create new company
            const { error } = await supabase.from("company").insert({
                user_id: user.id,
                company_name: companyName,
                account_balance: balance,
                opening_balance: balance,
                closing_balance: balance,
            });

            if (error) throw error;

            toast({
                title: "Success",
                description: "Company information saved successfully.",
            });
            navigate("/dashboard");
        } catch (error) {
            console.error("Error saving company:", error);
            toast({
                title: "Error",
                description: "Failed to save company information.",
                variant: "destructive",
            });
        } finally {
            setCompanyLoading(false);
        }
    };

    // If company exists, don't render the form
    if (company) {
        return null;
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Company Information Section */}
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-semibold mb-2">Company Information</h2>
                        <p className="text-gray-500">
                            Set up your company information
                        </p>
                    </div>
                    <form onSubmit={handleCompanySubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="companyName" className="text-sm font-medium">
                                Company Name
                            </label>
                            <Input
                                id="companyName"
                                placeholder="Enter your company name"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                required
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
                                value={currentBalance}
                                onChange={(e) => setCurrentBalance(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" disabled={companyLoading} className="w-full">
                            {companyLoading ? "Saving..." : "Create Company"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
} 