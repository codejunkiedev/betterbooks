import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Company } from "@/interfaces/profile";

export function useCompany() {
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchCompany = async () => {
            try {
                const { data, error } = await supabase
                    .from("company")
                    .select("*")
                    .eq("user_id", user.id)
                    .single();

                if (error) {
                    if (error.code === "PGRST116") {
                        // No company found
                        setCompany(null);
                    } else {
                        console.error("Error fetching company:", error);
                    }
                } else {
                    setCompany(data);
                }
            } catch (error) {
                console.error("Error in useCompany:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCompany();
    }, [user]);

    const requireCompany = () => {
        if (!loading && !company && user) {
            navigate("/profile");
            return false;
        }
        return true;
    };

    return {
        company,
        loading,
        requireCompany,
    };
} 