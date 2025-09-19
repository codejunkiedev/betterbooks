import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/shared/hooks/useRedux";

interface AuthGuardProps {
    children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
    const { user, isAuthenticated } = useAppSelector(state => state.user);
    const { onboardingStatus } = useAppSelector(state => state.company);

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