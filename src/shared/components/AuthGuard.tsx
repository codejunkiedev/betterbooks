import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/shared/hooks/useRedux";

interface AuthGuardProps {
    children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
    const { user, isAuthenticated } = useAppSelector(state => state.user);
    const { currentCompany } = useAppSelector(state => state.company);

    // If user is authenticated, redirect based on company status
    if (isAuthenticated && user) {
        if (currentCompany) {
            return <Navigate to="/" replace />;
        } else {
            return <Navigate to="/onboarding" replace />;
        }
    }

    // If not authenticated, show the login page
    return <>{children}</>;
} 