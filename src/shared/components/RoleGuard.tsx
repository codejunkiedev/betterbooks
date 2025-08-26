import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { UserRole } from "@/shared/types/auth";

import { LoadingSpinner } from "@/shared/components/Loading";
import { useAppSelector, useAppDispatch } from "@/shared/hooks/useRedux";
import { getUserRoleFromDB } from "@/shared/services/supabase/auth";
import { checkOnboardingStatus } from "@/shared/services/store/companySlice";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const location = useLocation();
  const { user, isAuthenticated, loading } = useAppSelector(
    (state) => state.user
  );
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const role = await getUserRoleFromDB(user);
        setUserRole(role);
      } catch (error) {
        console.error("Error fetching user role:", error);
        setUserRole("USER");
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user) {
      fetchUserRole();
    } else {
      setIsLoading(false);
    }
  }, [user, isAuthenticated]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    const loginPath = location.pathname.startsWith("/accountant")
      ? "/accountant/login"
      : location.pathname.startsWith("/admin")
      ? "/admin/login"
      : "/login";
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (!userRole || !allowedRoles.includes(userRole)) {
    const redirectPath =
      userRole === "ACCOUNTANT"
        ? "/accountant"
        : userRole === "ADMIN"
        ? "/admin"
        : "/";
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}

export function UserGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, isAuthenticated, loading } = useAppSelector(
    (state) => state.user
  );
  const {
    currentCompany,
    onboardingStatus,
    isLoading: companyLoading,
  } = useAppSelector((state) => state.company);
  const dispatch = useAppDispatch();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const role = await getUserRoleFromDB(user);
        setUserRole(role);

        // If user is USER role and no onboarding status, check it
        if (role === "USER" && !onboardingStatus) {
          dispatch(checkOnboardingStatus(user.id));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUserRole("USER");
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user) {
      fetchUserData();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, onboardingStatus, dispatch]);

  if (loading || isLoading || companyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect non-USER roles to their dashboards
  if (userRole && userRole !== "USER") {
    const redirectPath = userRole === "ACCOUNTANT" ? "/accountant" : "/admin";
    return <Navigate to={redirectPath} replace />;
  }

  // Handle USER role company and FBR profile checks
  if (userRole === "USER") {
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
  return <RoleGuard allowedRoles={["ACCOUNTANT"]}>{children}</RoleGuard>;
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={["ADMIN"]}>{children}</RoleGuard>;
}

export function AccountantOrAdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["ACCOUNTANT", "ADMIN"]}>{children}</RoleGuard>
  );
}
