import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/shared/hooks/useRedux";
import { getCompanyByUserId } from "@/shared/services/supabase/company";
import { getFbrProfileByUser } from "@/shared/services/supabase/fbr";
import { setCurrentCompany } from "@/shared/services/store/companySlice";
import { LoadingSpinner } from "@/shared/components/Loading";

interface AuthGuardProps {
    children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
    const { user, isAuthenticated } = useAppSelector(state => state.user);
    const { currentCompany } = useAppSelector(state => state.company);
    const dispatch = useAppDispatch();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const checkOnboardingStatus = async () => {
            if (isAuthenticated && user && !currentCompany) {
                setIsLoading(true);
                try {
                    const [company, fbrProfile] = await Promise.all([
                        getCompanyByUserId(user.id),
                        getFbrProfileByUser(user.id).catch(() => null) // Handle case where FBR profile doesn't exist
                    ]);

                    if (company) {
                        dispatch(setCurrentCompany(company));
                    }

                    // Check if user has completed onboarding (both company and FBR profile)
                    const hasCompletedOnboarding = !!company && !!fbrProfile;

                    if (hasCompletedOnboarding) {
                        // User has completed onboarding, they can access dashboard
                        // The UserGuard will handle the final routing
                    } else {
                        // User hasn't completed onboarding, redirect to onboarding
                        // This will be handled by UserGuard
                    }
                } catch (error) {
                    console.error('Error checking onboarding status:', error);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        checkOnboardingStatus();
    }, [isAuthenticated, user, currentCompany, dispatch]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <LoadingSpinner />
            </div>
        );
    }

    // If user is authenticated, let UserGuard handle the routing
    if (isAuthenticated && user) {
        // UserGuard will handle the routing based on company and FBR profile status
        return <Navigate to="/" replace />;
    }

    // If not authenticated, show the login page
    return <>{children}</>;
} 