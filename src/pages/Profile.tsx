import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Company } from "@/interfaces/profile";


export default function Profile() {
    const [companyName, setCompanyName] = useState("");
    const [openingBalance, setOpeningBalance] = useState("");
    const [loading, setLoading] = useState(false);
    const [company, setCompany] = useState<Company | null>(null);
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        if (user) {
            fetchCompany();
        }
    }, [user]);

    const fetchCompany = async () => {
        try {
            const { data, error } = await supabase
                .from("company")
                .select("*")
                .eq("user_id", user?.id)
                .single();

            if (error) throw error;

            if (data) {
                setCompany(data);
                setCompanyName(data.company_name);
                setOpeningBalance(data.opening_balance.toString());
            }
        } catch (error) {
            console.error("Error fetching company:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!companyName || !openingBalance) {
            toast({
                title: "Error",
                description: "All fields are required.",
                variant: "destructive",
            });
            return;
        }

        const balance = parseFloat(openingBalance);
        if (isNaN(balance)) {
            toast({
                title: "Error",
                description: "Opening balance must be a valid number.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            if (company) {
                // Update existing company
                const { error } = await supabase
                    .from("company")
                    .update({
                        company_name: companyName,
                        opening_balance: balance,
                        account_balance: balance,
                        closing_balance: balance,
                    })
                    .eq("id", company.id);

                if (error) throw error;
            } else {
                // Create new company
                const { error } = await supabase.from("company").insert({
                    company_name: companyName,
                    opening_balance: balance,
                    account_balance: balance,
                    closing_balance: balance,
                });

                if (error) throw error;
            }

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
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted">
            <Card className="w-full max-w-md shadow-lg border-0 rounded-xl">
                <CardHeader>
                    <CardTitle className="text-center">Company Profile</CardTitle>
                    <CardDescription className="text-center">
                        {company ? "Update your company information" : "Set up your company information"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
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
                            <label htmlFor="openingBalance" className="text-sm font-medium">
                                Opening Balance
                            </label>
                            <Input
                                id="openingBalance"
                                type="number"
                                step="0.01"
                                placeholder="Enter opening balance"
                                value={openingBalance}
                                onChange={(e) => setOpeningBalance(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? "Saving..." : company ? "Update Company" : "Create Company"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
} 