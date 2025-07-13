import { useRoutes } from "react-router-dom";
import SignUp from "@/pages/SignUp";
import Login from "@/pages/Login";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import NotFound from "@/pages/NotFound";
import Dashboard from "@/pages/Dashboard";
import DashboardLayout from "@/components/layout/DashboardLayout";
import UploadDocuments from "@/pages/UploadDocuments";
import DocumentsList from "@/pages/DocumentsList";
import InvoiceSuggestion from "@/pages/AISuggestion";
import Profile from "@/pages/Profile";
import CompanySetup from "@/pages/CompanySetup";

export default function App() {
  const routes = useRoutes([
    {
      path: "/",
      element: <DashboardLayout />,
      children: [
        { path: "", element: <Dashboard /> },
        { path: "upload", element: <UploadDocuments /> },
        { path: "documents", element: <DocumentsList /> },
        { path: "ai-suggestion", element: <InvoiceSuggestion /> },
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
