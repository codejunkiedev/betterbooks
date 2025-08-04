import { useRoutes, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/useRedux";
import { initializeAuth, setupAuthListener } from "@/shared/services/store/userSlice";


import { LoadingScreen } from "@/shared/components/Loading";
import { SignUp, ForgotPassword, ResetPassword, LoginPortal } from "@/pages/shared/auth";

import Unauthorized from "@/shared/components/Unauthorized";

// Role-specific login pages
import UserLogin from "@/pages/user/Login";
import AccountantLogin from "@/pages/accountant/Login";
import AdminLogin from "@/pages/admin/Login";

// Layouts
import { UserLayout, AccountantLayout, AdminLayout } from "@/shared/layout";

// User Pages
import UserDashboard from "@/pages/user/Dashboard";
import UploadDocuments from "@/pages/user/UploadDocuments";
import DocumentsList from "@/pages/user/Documents";
import Journal from "@/pages/user/Journal";
import Reports from "@/pages/user/Reports";
import Messages from "@/pages/user/Messages";

import Profile from "@/pages/user/Profile";
import Onboarding from "@/pages/user/Onboarding";
import Blocked from "@/pages/user/Blocked";

// Accountant Pages
import AccountantDashboard from "@/pages/accountant/Dashboard";
import AccountantClients from "@/pages/accountant/Clients";
import AccountantBankStatements from "@/pages/accountant/BankStatements";
import AccountantTaxDocuments from "@/pages/accountant/TaxDocuments";
import AccountantActivityLogs from "@/pages/accountant/ActivityLogs";

// Admin Pages
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminUserManagement from "@/pages/admin/UserManagement";
import RoleManagement from "@/pages/admin/RoleManagement";

// Role Guards
import { UserGuard, AccountantGuard, AdminGuard } from "@/shared/components/RoleGuard";

import AuthGuard from "@/shared/components/AuthGuard";



export default function App() {
  const dispatch = useAppDispatch();
  const { isInitialized } = useAppSelector(state => state.user);

  useEffect(() => {
    const initialize = async () => {
      // Initialize auth state
      await dispatch(initializeAuth());

      // Set up auth listener
      await dispatch(setupAuthListener());
    };

    initialize();
  }, [dispatch]);


  const routes = useRoutes([
    // Public Routes
    { path: "/portal", element: <LoginPortal /> }, // Login portal selection
    { path: "/signup", element: <AuthGuard><SignUp /></AuthGuard> },
    { path: "/login", element: <AuthGuard><UserLogin /></AuthGuard> }, // Default user login
    { path: "/accountant/login", element: <AuthGuard><AccountantLogin /></AuthGuard> },
    { path: "/admin/login", element: <AuthGuard><AdminLogin /></AuthGuard> },
    { path: "/forgot-password", element: <ForgotPassword /> },
    { path: "/reset-password", element: <ResetPassword /> },
    { path: "/unauthorized", element: <Unauthorized /> },

    // User Routes (Protected)
    {
      path: "/",
      element: (
        <UserGuard>
          <UserLayout />
        </UserGuard>
      ),
      children: [
        { path: "", element: <UserDashboard /> },
        { path: "upload", element: <UploadDocuments /> },
        { path: "documents", element: <DocumentsList /> },
        { path: "journal", element: <Journal /> },
        { path: "reports", element: <Reports /> },
        { path: "messages", element: <Messages /> },
        { path: "profile", element: <Profile /> },
      ],
    },

    // Onboarding Route (Protected by UserGuard)
    {
      path: "/onboarding",
      element: (
        <UserGuard>
          <Onboarding />
        </UserGuard>
      ),
    },

    // Blocked Route (Protected by UserGuard)
    {
      path: "/blocked",
      element: (
        <UserGuard>
          <Blocked />
        </UserGuard>
      ),
    },

    // Accountant Routes (Protected)
    {
      path: "/accountant",
      element: (
        <AccountantGuard>
          <AccountantLayout />
        </AccountantGuard>
      ),
      children: [
        { path: "", element: <AccountantDashboard /> },
        { path: "clients", element: <AccountantClients /> },
        { path: "bank-statements", element: <AccountantBankStatements /> },
        { path: "tax-documents", element: <AccountantTaxDocuments /> },
        { path: "activity-logs", element: <AccountantActivityLogs /> },
      ],
    },

    // Admin Routes (Protected)
    {
      path: "/admin",
      element: (
        <AdminGuard>
          <AdminLayout />
        </AdminGuard>
      ),
      children: [
        { path: "", element: <AdminDashboard /> },
        { path: "users", element: <AdminUserManagement /> },
        { path: "roles", element: <RoleManagement /> },
      ],
    },

    // Catch-all - Simple redirect to dashboard
    { path: "*", element: <Navigate to="/" replace /> },
  ]);

  // Show loading spinner only during initial app setup
  if (!isInitialized) {
    return <LoadingScreen />;
  }

  return <>{routes}</>;
}
