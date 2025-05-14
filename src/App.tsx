import { useRoutes } from "react-router-dom";
import SignUp from "@/pages/SignUp";
import Login from "@/pages/Login";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import NotFound from "@/pages/NotFound";
import Dashboard from "@/pages/Dashboard";
import DashboardLayout from "@/components/layout/DashboardLayout";
import UploadDocument from "@/pages/UploadInvoice";
import InvoiceSuggestion from "@/pages/AISuggestion";

export default function App() {
  const routes = useRoutes([
    {
      path: "/",
      element: <DashboardLayout />,
      children: [
        { path: "", element: <Dashboard /> },
        { path: "upload", element: <UploadDocument /> },
        { path: "ai-suggestion", element: <InvoiceSuggestion /> },
        { path: "profile", element: <div>Profile Page</div> },
      ],
    },
    { path: "/signup", element: <SignUp /> },
    { path: "/login", element: <Login /> },
    { path: "/forgot-password", element: <ForgotPassword /> },
    { path: "/reset-password", element: <ResetPassword /> },
    { path: "*", element: <NotFound /> },
  ]);
  return <>{routes}</>;
}
