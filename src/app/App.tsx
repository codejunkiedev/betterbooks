import { useRoutes } from "react-router-dom";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/useRedux";
import { initializeAuth, setupAuthListener } from "@/shared/services/store/userSlice";
import { LoadingSpinner } from "@/shared/components/Loading";
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
import CompanySetup from "@/pages/user/CompanySetup";

// Accountant Pages
import AccountantDashboard from "@/pages/accountant/Dashboard";
import AccountantClients from "@/pages/accountant/Clients";

// Admin Pages
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminUserManagement from "@/pages/admin/UserManagement";
import RoleManagement from "@/pages/admin/RoleManagement";

// Role Guards
import { UserGuard, AccountantGuard, AdminGuard } from "@/shared/components/RoleGuard";

export default function App() {
  const dispatch = useAppDispatch();
  const { isInitialized, loading } = useAppSelector(state => state.user);

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
    { path: "/signup", element: <SignUp /> },
    { path: "/login", element: <UserLogin /> }, // Default user login
    { path: "/accountant/login", element: <AccountantLogin /> },
    { path: "/admin/login", element: <AdminLogin /> },
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
        { path: "ai-suggestion", element: <AISuggestion /> },
        { path: "profile", element: <Profile /> },
        { path: "company-setup", element: <CompanySetup /> },
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
        { path: "documents", element: <div>Accountant Documents</div> },
        { path: "reviews", element: <div>Document Reviews</div> },
        { path: "reports", element: <div>Reports</div> },
        { path: "billing", element: <div>Billing</div> },
        { path: "settings", element: <div>Settings</div> },
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
        { path: "companies", element: <div>Company Management</div> },
        { path: "system", element: <div>System Health</div> },
        { path: "analytics", element: <div>Analytics</div> },
        { path: "security", element: <div>Security</div> },
        { path: "database", element: <div>Database Management</div> },
        { path: "logs", element: <div>System Logs</div> },
        { path: "settings", element: <div>Admin Settings</div> },
      ],
    },

    // Catch-all
    { path: "*", element: <NotFound /> },
  ]);

  // Show loading spinner while initializing
  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner text="Initializing application..." />
      </div>
    );
  }

  return <>{routes}</>;
}
