import { useRoutes, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../core/domain/entities/User';

// Auth pages
import SignUp from '../pages/SignUp';
import Login from '../pages/Login';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';

// User pages
import UserDashboard from '../pages/user/Dashboard';
import UserDocuments from '../pages/user/DocumentsList';
import UserUpload from '../pages/user/UploadDocuments';
import UserProfile from '../pages/user/Profile';
import CompanySetup from '../pages/CompanySetup';

// Accountant pages
import AccountantDashboard from '../pages/accountant/AccountantDashboard';
import AccountantClients from '../pages/accountant/AccountantClients';
import AccountantDocuments from '../pages/accountant/AccountantDocuments';
import AccountantJournal from '../pages/accountant/AccountantDashboard'; // Use AccountantDashboard as placeholder for journal
import AccountantProfile from '../pages/user/Profile'; // Use user Profile for all roles

// Admin pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminAccountants from '../pages/admin/AdminAccountants';
import AdminCompanies from '../pages/admin/AdminCompanies';
import AdminSettings from '../pages/admin/AdminDashboard'; // Use AdminDashboard as placeholder for settings
import AdminProfile from '../pages/user/Profile'; // Use user Profile for all roles

// Shared components
import NotFound from '../pages/NotFound';
import { LoadingSpinner } from '../components/ui/loading';
import DashboardLayout from '../components/layout/DashboardLayout';

// Protected route component
const ProtectedRoute = ({
    children,
    allowedRoles,
    redirectTo = '/login'
}: {
    children: React.ReactNode;
    allowedRoles: UserRole[];
    redirectTo?: string;
}) => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (!user) {
        return <Navigate to={redirectTo} replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        // Redirect based on user role
        switch (user.role) {
            case UserRole.USER:
                return <Navigate to="/dashboard" replace />;
            case UserRole.ACCOUNTANT:
                return <Navigate to="/accountant/dashboard" replace />;
            case UserRole.ADMIN:
                return <Navigate to="/admin/dashboard" replace />;
            default:
                return <Navigate to="/login" replace />;
        }
    }

    return <>{children}</>;
};

export default function AppRoutes() {
    const { user, isLoading } = useAuth();

    console.log(user);

    const routes = useRoutes([
        // Auth routes (public)
        { path: '/login', element: <Login /> },
        { path: '/signup', element: <SignUp /> },
        { path: '/forgot-password', element: <ForgotPassword /> },
        { path: '/reset-password', element: <ResetPassword /> },

        // Public routes
        { path: '/company-setup', element: <CompanySetup /> },
        { path: '/404', element: <NotFound /> },

        // Default redirect for root path
        {
            path: '/',
            element: (() => {
                if (isLoading) return <LoadingSpinner />;
                if (!user) return <Navigate to="/login" replace />;

                // Redirect based on user role
                switch (user.role) {
                    case UserRole.USER:
                        return <Navigate to="/dashboard" replace />;
                    case UserRole.ACCOUNTANT:
                        return <Navigate to="/accountant/dashboard" replace />;
                    case UserRole.ADMIN:
                        return <Navigate to="/admin/dashboard" replace />;
                    default:
                        return <Navigate to="/login" replace />;
                }
            })()
        },

        // User routes
        {
            path: '/dashboard',
            element: <DashboardLayout />,
            children: [
                { path: '', element: <ProtectedRoute allowedRoles={[UserRole.USER]}><UserDashboard /></ProtectedRoute> },
                { path: 'documents', element: <ProtectedRoute allowedRoles={[UserRole.USER]}><UserDocuments /></ProtectedRoute> },
                { path: 'upload', element: <ProtectedRoute allowedRoles={[UserRole.USER]}><UserUpload /></ProtectedRoute> },
                { path: 'profile', element: <ProtectedRoute allowedRoles={[UserRole.USER]}><UserProfile /></ProtectedRoute> },
            ]
        },

        // Accountant routes
        {
            path: '/accountant',
            element: <DashboardLayout />,
            children: [
                { path: '', element: <ProtectedRoute allowedRoles={[UserRole.ACCOUNTANT]}><AccountantDashboard /></ProtectedRoute> },
                { path: 'dashboard', element: <ProtectedRoute allowedRoles={[UserRole.ACCOUNTANT]}><AccountantDashboard /></ProtectedRoute> },
                { path: 'clients', element: <ProtectedRoute allowedRoles={[UserRole.ACCOUNTANT]}><AccountantClients /></ProtectedRoute> },
                { path: 'documents', element: <ProtectedRoute allowedRoles={[UserRole.ACCOUNTANT]}><AccountantDocuments /></ProtectedRoute> },
                { path: 'journal-entries', element: <ProtectedRoute allowedRoles={[UserRole.ACCOUNTANT]}><AccountantJournal /></ProtectedRoute> },
                { path: 'reports', element: <ProtectedRoute allowedRoles={[UserRole.ACCOUNTANT]}><AccountantDashboard /></ProtectedRoute> },
                { path: 'profile', element: <ProtectedRoute allowedRoles={[UserRole.ACCOUNTANT]}><AccountantProfile /></ProtectedRoute> },
            ]
        },

        // Admin routes
        {
            path: '/admin',
            element: <DashboardLayout />,
            children: [
                { path: '', element: <ProtectedRoute allowedRoles={[UserRole.ADMIN]}><AdminDashboard /></ProtectedRoute> },
                { path: 'dashboard', element: <ProtectedRoute allowedRoles={[UserRole.ADMIN]}><AdminDashboard /></ProtectedRoute> },
                { path: 'users', element: <ProtectedRoute allowedRoles={[UserRole.ADMIN]}><AdminUsers /></ProtectedRoute> },
                { path: 'accountants', element: <ProtectedRoute allowedRoles={[UserRole.ADMIN]}><AdminAccountants /></ProtectedRoute> },
                { path: 'companies', element: <ProtectedRoute allowedRoles={[UserRole.ADMIN]}><AdminCompanies /></ProtectedRoute> },
                { path: 'settings', element: <ProtectedRoute allowedRoles={[UserRole.ADMIN]}><AdminSettings /></ProtectedRoute> },
                { path: 'activity-logs', element: <ProtectedRoute allowedRoles={[UserRole.ADMIN]}><AdminDashboard /></ProtectedRoute> },
                { path: 'security', element: <ProtectedRoute allowedRoles={[UserRole.ADMIN]}><AdminDashboard /></ProtectedRoute> },
                { path: 'reports', element: <ProtectedRoute allowedRoles={[UserRole.ADMIN]}><AdminDashboard /></ProtectedRoute> },
                { path: 'profile', element: <ProtectedRoute allowedRoles={[UserRole.ADMIN]}><AdminProfile /></ProtectedRoute> },
            ]
        },

        // Catch all
        { path: '*', element: <Navigate to="/404" replace /> }
    ]);

    return routes;
} 