import { Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/shared/hooks/useRedux";
import { checkOnboardingStatus } from "@/shared/services/store/companySlice";
import { LoadingSpinner } from "@/shared/components/Loading";

interface AuthGuardProps {
    children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
    const { user, isAuthenticated } = useAppSelector(state => state.user);
    const { onboardingStatus, isLoading } = useAppSelector(state => state.company);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (isAuthenticated && user && !onboardingStatus) {
            dispatch(checkOnboardingStatus(user.id));
        }
    }, [isAuthenticated, user, onboardingStatus, dispatch]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <LoadingSpinner />
            </div>
        );
    }

    // If user is authenticated, redirect based on onboarding status
    if (isAuthenticated && user && onboardingStatus) {
        if (onboardingStatus.isCompleted) {
            // User has completed onboarding, redirect to dashboard
            return <Navigate to="/" replace />;
        } else {
            // User hasn't completed onboarding, redirect to onboarding
            return <Navigate to="/onboarding" replace />;
        }
    }

    // If not authenticated, show the login page
    return <>{children}</>;
} 