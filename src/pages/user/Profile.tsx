import { Input } from "@/shared/components/Input";
import { Button } from "@/shared/components/Button";
import { useToast } from "@/shared/hooks/useToast";
import { createCompany, updateCompany, getCompanyByUserId } from "@/shared/services/supabase/company";
import { createProfile } from "@/shared/services/supabase/profile";
import { useSelector } from "react-redux";
import { RootState } from "@/shared/services/store";
import { useState, useEffect } from "react";
import { FILING_STATUSES, COMPANY_TYPES, CompanyType } from "@/shared/constants/company";
import { supabase } from "@/shared/services/supabase/client";

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
        company_type: "" as CompanyType | "",
        tax_id_number: "",
        filing_status: "",
        tax_year_end: "",
    });

    useEffect(() => {
        const fetchCompany = async () => {
            if (userState.user?.id) {
                try {
                    // Log environment information
                    console.log("Environment check:", {
                        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
                        hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
                        nodeEnv: import.meta.env.MODE,
                        user: userState.user.id
                    });
                    
                    // Test database connection first
                    console.log("Testing database connection...");
                    const { error: testError } = await supabase
                        .from("profiles")
                        .select("count")
                        .limit(1);
                    
                    if (testError) {
                        console.error("Database connection test failed:", testError);
                    } else {
                        console.log("Database connection successful");
                    }
                    
                    const companyData = await getCompanyByUserId(userState.user.id);
                    if (companyData) {
                        setCompany(companyData);
                        setFormData({
                            company_name: companyData.name || "",
                            company_type: (companyData.type as CompanyType) || "",
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
            // Check authentication status
            const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
            
            if (authError || !currentUser) {
                console.error("Authentication error:", authError);
                toast({
                    title: "Error",
                    description: "User not authenticated. Please log in again.",
                    variant: "destructive",
                });
                return;
            }
            
            console.log("User authenticated:", currentUser.id);

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

            // First, ensure a profile exists for the user
            let profileId = userState.user.id;
            console.log("Starting company creation process for user:", userState.user.id);
            console.log("Profile ID to use:", profileId);
            
            try {
                const { data: existingProfile } = await supabase
                    .from("profiles")
                    .select("id")
                    .eq("id", userState.user.id)
                    .maybeSingle();

                console.log("Existing profile check:", existingProfile);

                if (!existingProfile) {
                    console.log("Creating new profile for user:", userState.user.id);
                    // Create profile if it doesn't exist
                    const { error: profileError } = await createProfile({
                        userId: userState.user.id,
                        full_name: userState.user.user_metadata?.full_name || "",
                        avatar_url: userState.user.user_metadata?.avatar_url || "",
                    });

                    if (profileError) {
                        console.error("Error creating profile:", profileError);
                        toast({
                            title: "Error",
                            description: "Failed to create user profile.",
                            variant: "destructive",
                        });
                        return;
                    }
                    console.log("Profile created successfully");
                    
                    // Verify the profile was created by fetching it
                    const { data: verifyProfile, error: verifyError } = await supabase
                        .from("profiles")
                        .select("id")
                        .eq("id", userState.user.id)
                        .maybeSingle();
                    
                    if (verifyError || !verifyProfile) {
                        console.error("Profile verification failed:", verifyError);
                        toast({
                            title: "Error",
                            description: "Profile creation verification failed.",
                            variant: "destructive",
                        });
                        return;
                    }
                    
                    console.log("Profile verified:", verifyProfile.id);
                    profileId = verifyProfile.id; // Use the verified profile ID
                    
                    // Test companies table access
                    console.log("Testing companies table access...");
                    const { error: companiesTestError } = await supabase
                        .from("companies")
                        .select("count")
                        .limit(1);
                    
                    if (companiesTestError) {
                        console.error("Companies table access test failed:", companiesTestError);
                        toast({
                            title: "Error",
                            description: "Companies table access failed.",
                            variant: "destructive",
                        });
                        return;
                    } else {
                        console.log("Companies table access successful");
                    }
                } else {
                    console.log("Profile already exists:", existingProfile.id);
                    profileId = existingProfile.id; // Use the existing profile ID
                }
                
                console.log("Final profile ID to use for company creation:", profileId);
            } catch (profileError) {
                console.error("Error handling profile:", profileError);
                toast({
                    title: "Error",
                    description: "Failed to handle user profile.",
                    variant: "destructive",
                });
                return;
            }

            if (company?.id) {
                console.log("Updating existing company:", company.id);
                // Update existing company
                await updateCompany(company.id, {
                    name: formData.company_name,
                    type: formData.company_type || "SMALL_BUSINESS",
                    tax_id_number: formData.tax_id_number,
                    filing_status: formData.filing_status,
                    tax_year_end: formData.tax_year_end,
                });

                // Refresh company data
                const updatedCompany = await getCompanyByUserId(profileId);
                setCompany(updatedCompany);
            } else {
                console.log("Creating new company with data:", {
                    user_id: profileId,
                    name: formData.company_name,
                    type: formData.company_type || "SMALL_BUSINESS",
                    tax_id_number: formData.tax_id_number,
                    filing_status: formData.filing_status,
                    tax_year_end: formData.tax_year_end,
                });
                
                // Create new company with all the form data
                const newCompany = await createCompany({
                    user_id: profileId, // Use profile ID instead of user ID
                    name: formData.company_name,
                    type: formData.company_type || "SMALL_BUSINESS", // Use selected type or default
                    tax_id_number: formData.tax_id_number,
                    filing_status: formData.filing_status,
                    tax_year_end: formData.tax_year_end,
                });

                console.log("Company created successfully:", newCompany);
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
            
            // Log more detailed error information
            if (error instanceof Error) {
                console.error("Error message:", error.message);
                console.error("Error stack:", error.stack);
            }
            
            // Check if it's a Supabase error
            if (error && typeof error === 'object' && 'message' in error) {
                console.error("Supabase error details:", error);
            }
            
            toast({
                title: "Error",
                description: `Failed to save company information: ${error instanceof Error ? error.message : 'Unknown error'}`,
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

                        <div className="space-y-2">
                            <label htmlFor="companyType" className="text-sm font-medium">
                                Company Type
                            </label>
                            <select
                                id="companyType"
                                value={formData.company_type || ""}
                                onChange={e => setFormData(prev => ({ ...prev, company_type: e.target.value as CompanyType }))}
                                disabled={isLoading}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="">Select Company Type</option>
                                {COMPANY_TYPES.map(type => (
                                    <option key={type} value={type}>
                                        {type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                                    </option>
                                ))}
                            </select>
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