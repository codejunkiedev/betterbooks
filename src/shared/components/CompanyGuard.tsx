import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "@/shared/hooks/useRedux";

interface CompanyGuardProps {
    children: React.ReactNode;
}

export default function CompanyGuard({ children }: CompanyGuardProps) {
    const location = useLocation();
    const { user, isAuthenticated } = useAppSelector(state => state.user);
    const { currentCompany } = useAppSelector(state => state.company);

    // If user is not authenticated, let the auth system handle it
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If no company exists and we're not already on onboarding page, redirect to onboarding
    if (!currentCompany && location.pathname !== "/onboarding") {
        return <Navigate to="/onboarding" replace />;
    }

    // If company exists and we're on onboarding page, redirect to dashboard
    if (currentCompany && location.pathname === "/onboarding") {
        return <Navigate to="/" replace />;
    }

    // Otherwise, render the children
    return <>{children}</>;
} 