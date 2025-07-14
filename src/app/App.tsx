import { useRoutes } from "react-router-dom";
import { SignUp, Login, ForgotPassword, ResetPassword } from "@/pages/shared/auth";
import NotFound from "@/shared/components/NotFound";
import Dashboard from "@/pages/user/Dashboard";
import DashboardLayout from "@/shared/components/DashboardLayout";
import UploadDocuments from "@/pages/user/UploadDocuments";
import DocumentsList from "@/pages/user/Documents";
import AISuggestion from "@/pages/user/AISuggestion";
import Profile from "@/pages/user/Profile";
import CompanySetup from "@/pages/user/CompanySetup";

export default function App() {
  const routes = useRoutes([
    {
      path: "/",
      element: <DashboardLayout />,
      children: [
        { path: "", element: <Dashboard /> },
        { path: "upload", element: <UploadDocuments /> },
        { path: "documents", element: <DocumentsList /> },
        { path: "ai-suggestion", element: <AISuggestion /> },
        { path: "profile", element: <Profile /> },
      ],
    },
    { path: "/signup", element: <SignUp /> },
    { path: "/login", element: <Login /> },
    { path: "/forgot-password", element: <ForgotPassword /> },
    { path: "/reset-password", element: <ResetPassword /> },
    { path: "/company-setup", element: <CompanySetup /> },
    { path: "*", element: <NotFound /> },
  ]);
  return <>{routes}</>;
}
