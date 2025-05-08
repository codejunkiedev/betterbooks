import { useRoutes } from "react-router-dom";
import SignUp from "@/pages/SignUp";
import Login from "@/pages/Login";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import NotFound from "@/pages/NotFound";

function Home() {
  return <div className="p-8 text-2xl font-bold">Welcome to BetterBooks</div>;
}

function Upload() {
  return <div className="p-8 text-2xl font-bold">Upload Invoice Page</div>;
}

export default function App() {
  const routes = useRoutes([
    { path: "/", element: <Home /> },
    { path: "/signup", element: <SignUp /> },
    { path: "/upload", element: <Upload /> },
    { path: "/login", element: <Login /> },
    { path: "/forgot-password", element: <ForgotPassword /> },
    { path: "/reset-password", element: <ResetPassword /> },
    { path: "*", element: <NotFound /> },
  ]);
  return <>{routes}</>;
}
