import { useRoutes } from "react-router-dom";
import SignUpPage from "@/pages/SignUpPage";
import LoginPage from "@/pages/LoginPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import NotFound from "@/shared/components/NotFound";
import DashboardPage from "@/pages/DashboardPage";
import DashboardLayout from "@/shared/components/DashboardLayout";
import UploadDocumentsPage from "@/pages/UploadDocumentsPage";
import DocumentsListPage from "@/pages/DocumentsListPage";
import AISuggestionPage from "@/pages/AISuggestionPage";
import ProfilePage from "@/pages/ProfilePage";
import CompanySetupPage from "@/pages/CompanySetupPage";

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
