import { useRoutes } from "react-router-dom";
import SignUpPage from "@/pages/shared/auth/SignUpPage";
import LoginPage from "@/pages/shared/auth/LoginPage";
import ForgotPasswordPage from "@/pages/shared/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/shared/auth/ResetPasswordPage";
import NotFound from "@/shared/components/NotFound";
import DashboardPage from "@/pages/user/DashboardPage";
import DashboardLayout from "@/shared/components/DashboardLayout";
import UploadDocumentsPage from "@/pages/user/UploadDocumentsPage";
import DocumentsListPage from "@/pages/user/DocumentsListPage";
import AISuggestionPage from "@/pages/user/AISuggestionPage";
import ProfilePage from "@/pages/user/ProfilePage";
import CompanySetupPage from "@/pages/user/CompanySetupPage";

export default function App() {
  const routes = useRoutes([
    {
      path: "/",
      element: <DashboardLayout />,
      children: [
        { path: "", element: <DashboardPage /> },
        { path: "upload", element: <UploadDocumentsPage /> },
        { path: "documents", element: <DocumentsListPage /> },
        { path: "ai-suggestion", element: <AISuggestionPage /> },
        { path: "profile", element: <ProfilePage /> },
      ],
    },
    { path: "/signup", element: <SignUpPage /> },
    { path: "/login", element: <LoginPage /> },
    { path: "/forgot-password", element: <ForgotPasswordPage /> },
    { path: "/reset-password", element: <ResetPasswordPage /> },
    { path: "/company-setup", element: <CompanySetupPage /> },
    { path: "*", element: <NotFound /> },
  ]);
  return <>{routes}</>;
}
