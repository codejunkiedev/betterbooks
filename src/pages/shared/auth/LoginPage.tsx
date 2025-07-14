import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/shared/components/input";
import { Button } from "@/shared/components/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/shared/components/card";
import { useToast } from "@/shared/hooks/use-toast";
import { signIn } from "@/shared/services/supabase/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({ title: "Error", description: "Both fields are required.", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      toast({ title: "Login Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Logged in successfully!" });
      navigate("/");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <Card className="w-full max-w-md shadow-lg border-0 rounded-xl">
        <CardHeader>
          <CardTitle className="text-center">Sign In</CardTitle>
          <CardDescription className="text-center">
            Welcome back! Please enter your credentials to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
              autoFocus
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Logging In..." : "Log In"}
            </Button>
          </form>
          <div className="flex flex-col items-center gap-2 mt-6">
            <Link to="/forgot-password" className="text-blue-600 hover:underline text-sm">
              Forgot Password?
            </Link>
            <span className="text-xs text-muted-foreground">Don't have an account?</span>
            <Link to="/signup" className="text-blue-600 hover:underline text-sm">
              Create Account
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 