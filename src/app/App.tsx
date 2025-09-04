import { LoadingScreen } from "@/shared/components/Loading";
import { useAuth } from "@/shared/hooks/useAuth";
import { AppRoutes } from "@/shared/routes/AppRoutes";

export default function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return <AppRoutes />;
}
