import React from 'react';
import { useRoutes, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/shared/contexts/AuthContext';
import { UserRoute, AccountantRoute, AdminRoute } from '@/shared/components/ProtectedRoute';
import { RoleBasedLayout, AuthLayout } from '@/shared/layout/RoleBasedLayout';
import { ErrorBoundaryWrapper } from '@/shared/components/ErrorBoundary';
import { useAuth } from '@/shared/hooks/useAuth';
import { UserRole } from '@/shared/types';

// Import page components
import { Login } from '@/pages/shared/auth/Login';
import { SignUp } from '@/pages/shared/auth/SignUp';
import { ForgotPassword } from '@/pages/shared/auth/ForgotPassword';
import { ResetPassword } from '@/pages/shared/auth/ResetPassword';

// User pages
import { Dashboard } from '@/pages/user/Dashboard';
import { DocumentsList } from '@/pages/user/DocumentsList';
import { UploadDocuments } from '@/pages/user/UploadDocument';
import { Profile } from '@/pages/user/Profile';
import { CompanySetup } from '@/pages/user/CompanySetup';
import { InvoiceSuggestion } from '@/pages/user/AISuggestion';

// Loading component
const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
  </div>
);

// User Routes Configuration
const UserRoutes: React.FC = () => {
  const routes = useRoutes([
    {
      path: '/',
      element: <Navigate to="/dashboard" replace />
    },
    {
      path: '/dashboard',
      element: (
        <UserRoute>
          <RoleBasedLayout title="Dashboard" subtitle="Manage your business">
            <Dashboard />
          </RoleBasedLayout>
        </UserRoute>
      )
    },
    {
      path: '/documents',
      element: (
        <UserRoute>
          <RoleBasedLayout title="Documents" subtitle="Manage your documents">
            <DocumentsList />
          </RoleBasedLayout>
        </UserRoute>
      )
    },
    {
      path: '/upload',
      element: (
        <UserRoute>
          <RoleBasedLayout title="Upload Documents" subtitle="Upload invoices and statements">
            <UploadDocuments />
          </RoleBasedLayout>
        </UserRoute>
      )
    },
    {
      path: '/profile',
      element: (
        <UserRoute>
          <RoleBasedLayout title="Profile" subtitle="Manage your profile">
            <Profile />
          </RoleBasedLayout>
        </UserRoute>
      )
    },
    {
      path: '/company-setup',
      element: (
        <UserRoute>
          <CompanySetup />
        </UserRoute>
      )
    },
    {
      path: '/ai-suggestions',
      element: (
        <UserRoute>
          <RoleBasedLayout title="AI Suggestions" subtitle="Review and approve suggestions">
            <InvoiceSuggestion />
          </RoleBasedLayout>
        </UserRoute>
      )
    },
    {
      path: '*',
      element: <Navigate to="/dashboard" replace />
    }
  ]);

  return routes;
};

// Accountant Routes Configuration
const AccountantRoutes: React.FC = () => {
  const routes = useRoutes([
    {
      path: '/',
      element: <Navigate to="/dashboard" replace />
    },
    {
      path: '/dashboard',
      element: (
        <AccountantRoute>
          <RoleBasedLayout title="Accountant Dashboard" subtitle="Manage your clients">
            <div className="p-8">
              <h1 className="text-2xl font-bold mb-4">Accountant Dashboard</h1>
              <p>Accountant dashboard coming soon...</p>
            </div>
          </RoleBasedLayout>
        </AccountantRoute>
      )
    },
    {
      path: '*',
      element: <Navigate to="/dashboard" replace />
    }
  ]);

  return routes;
};

// Admin Routes Configuration
const AdminRoutes: React.FC = () => {
  const routes = useRoutes([
    {
      path: '/',
      element: <Navigate to="/dashboard" replace />
    },
    {
      path: '/dashboard',
      element: (
        <AdminRoute>
          <RoleBasedLayout title="Admin Dashboard" subtitle="System administration">
            <div className="p-8">
              <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
              <p>Admin dashboard coming soon...</p>
            </div>
          </RoleBasedLayout>
        </AdminRoute>
      )
    },
    {
      path: '*',
      element: <Navigate to="/dashboard" replace />
    }
  ]);

  return routes;
};

// Auth Routes Configuration
const AuthRoutes: React.FC = () => {
  const routes = useRoutes([
    {
      path: '/',
      element: <Navigate to="/login" replace />
    },
    {
      path: '/login',
      element: (
        <AuthLayout>
          <Login />
        </AuthLayout>
      )
    },
    {
      path: '/signup',
      element: (
        <AuthLayout>
          <SignUp />
        </AuthLayout>
      )
    },
    {
      path: '/forgot-password',
      element: (
        <AuthLayout>
          <ForgotPassword />
        </AuthLayout>
      )
    },
    {
      path: '/reset-password',
      element: (
        <AuthLayout>
          <ResetPassword />
        </AuthLayout>
      )
    },
    {
      path: '*',
      element: <Navigate to="/login" replace />
    }
  ]);

  return routes;
};

// Main App Routes
const AppRoutes: React.FC = () => {
  const { user, userPermissions, loading, error } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Connection Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500 mb-4">
              Please make sure your Supabase instance is running locally.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthRoutes />;
  }

  // Route based on user role
  switch (userPermissions?.role) {
    case UserRole.USER:
      return <UserRoutes />;
    case UserRole.ACCOUNTANT:
      return <AccountantRoutes />;
    case UserRole.ADMIN:
      return <AdminRoutes />;
    default:
      return <AuthRoutes />;
  }
};

const App: React.FC = () => {
  return (
    <ErrorBoundaryWrapper>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ErrorBoundaryWrapper>
  );
};

export default App;
