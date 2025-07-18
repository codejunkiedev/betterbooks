import { useRoutes } from "react-router-dom";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/useRedux";
import { initializeAuth, setupAuthListener } from "@/shared/services/store/userSlice";

import { LoadingScreen } from "@/shared/components/Loading";
import { SignUp, ForgotPassword, ResetPassword, LoginPortal } from "@/pages/shared/auth";
import NotFound from "@/shared/components/NotFound";
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
import AISuggestion from "@/pages/user/AISuggestion";
import Profile from "@/pages/user/Profile";
import Onboarding from "@/pages/user/Onboarding";

// Accountant Pages
import AccountantDashboard from "@/pages/accountant/Dashboard";
import AccountantClients from "@/pages/accountant/Clients";
import AccountantBankStatements from "@/pages/accountant/BankStatements";
import AccountantTaxDocuments from "@/pages/accountant/TaxDocuments";

// Admin Pages
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminUserManagement from "@/pages/admin/UserManagement";
import RoleManagement from "@/pages/admin/RoleManagement";

// Role Guards
import { UserGuard, AccountantGuard, AdminGuard } from "@/shared/components/RoleGuard";
import CompanyGuard from "@/shared/components/CompanyGuard";
import AuthGuard from "@/shared/components/AuthGuard";

export default function App() {
  const dispatch = useAppDispatch();
  const { isInitialized } = useAppSelector(state => state.user);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    const initialize = async () => {
      // Initialize auth state
      await dispatch(initializeAuth());

      // Set up auth listener
      const result = await dispatch(setupAuthListener());
      if (setupAuthListener.fulfilled.match(result)) {
        subscription = result.payload;
      }
    };

    initialize();

    // Cleanup function
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
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

    // Onboarding Route (Protected by UserGuard but not CompanyGuard)
    {
      path: "/onboarding",
      element: (
        <UserGuard>
          <Onboarding />
        </UserGuard>
      ),
    },

    // User Routes (Protected)
    {
      path: "/",
      element: (
        <UserGuard>
          <CompanyGuard>
            <UserLayout />
          </CompanyGuard>
        </UserGuard>
      ),
      children: [
        { path: "", element: <UserDashboard /> },
        { path: "upload", element: <UploadDocuments /> },
        { path: "documents", element: <DocumentsList /> },
        { path: "ai-suggestion", element: <AISuggestion /> },
        { path: "profile", element: <Profile /> },
      ],
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

    // Catch-all
    { path: "*", element: <NotFound /> },
  ]);

  // Show loading spinner only during initial app setup
  if (!isInitialized) {
    return <LoadingScreen />;
  }

  return <>{routes}</>;
}
