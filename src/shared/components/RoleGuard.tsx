import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { UserRoleEnum } from "@/shared/types/auth";
import { useAppSelector } from "@/shared/hooks/useRedux";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRoleEnum[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const location = useLocation();
  const { user, isAuthenticated, userRole } = useAppSelector((state) => state.user);

  if (!isAuthenticated || !user) {
    const loginPath = location.pathname.startsWith("/accountant")
      ? "/accountant/login"
      : location.pathname.startsWith("/admin")
        ? "/admin/login"
        : "/login";
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (!userRole || !allowedRoles.includes(userRole as UserRoleEnum)) {
    const redirectPath =
      userRole === UserRoleEnum.ACCOUNTANT
        ? "/accountant"
        : userRole === UserRoleEnum.ADMIN
          ? "/admin"
          : "/";
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}

export function UserGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, isAuthenticated, userRole } = useAppSelector((state) => state.user);
  const { currentCompany, onboardingStatus } = useAppSelector((state) => state.company);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect non-USER roles to their dashboards
  if (userRole && userRole !== UserRoleEnum.USER) {
    const redirectPath = userRole === UserRoleEnum.ACCOUNTANT ? "/accountant" : "/admin";
    return <Navigate to={redirectPath} replace />;
  }

  // Handle USER role company and FBR profile checks
  if (userRole === UserRoleEnum.USER) {
    const isOnboarding = location.pathname === "/onboarding";
    const isBlocked = location.pathname === "/blocked";

    // Check if user's company is deactivated
    if (currentCompany && !currentCompany.is_active && !isBlocked) {
      return <Navigate to="/blocked" replace />;
    }

    // Check if user has completed onboarding (both company and FBR profile)
    const hasCompletedOnboarding = onboardingStatus?.isCompleted === true;

    // If user has completed onboarding and is on onboarding page, redirect to home
    if (hasCompletedOnboarding && isOnboarding) {
      return <Navigate to="/" replace />;
    }

    // If user hasn't completed onboarding and is not on onboarding, redirect to onboarding
    if (!hasCompletedOnboarding && !isOnboarding && !isBlocked) {
      return <Navigate to="/onboarding" replace />;
    }
  }

  return <>{children}</>;
}

export function AccountantGuard({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={[UserRoleEnum.ACCOUNTANT]}>{children}</RoleGuard>;
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={[UserRoleEnum.ADMIN]}>{children}</RoleGuard>;
}

export function AccountantOrAdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={[UserRoleEnum.ACCOUNTANT, UserRoleEnum.ADMIN]}>{children}</RoleGuard>
  );
}
