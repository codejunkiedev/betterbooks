import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/shared/components/Input";
import { Button } from "@/shared/components/Button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/shared/components/Card";
import { useToast } from "@/shared/hooks/useToast";
import { signIn, signUp } from "@/shared/services/supabase/auth";
import { createProfile } from "@/shared/services/supabase/profile";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!email || !password || !confirm) {
      toast({ title: "Error", description: "All fields are required.", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    if (password.length < 8) {
      toast({ title: "Error", description: "Password must be at least 8 characters.", variant: "destructive" });
      return;
    }

    setLoading(true);

    const { error: signInError } = await signIn({ email, password });

    if (signInError) {
      if (signInError.message.includes("Email not confirmed")) {
        setLoading(false);
        toast({
          title: "Account already registered",
          description: "Please verify your account. Check your email for the verification link.",
          variant: "destructive",
        });
        return;
      }
      if (!signInError.message.includes("Invalid login credentials")) {
        setLoading(false);
        toast({
          title: "Error",
          description: signInError.message,
          variant: "destructive",
        });
        return;
      }
    } else {
      setLoading(false);
      toast({
        title: "Account already registered",
        description: "This email is already registered.",
        variant: "destructive",
      });
      return;
    }

    // If not registered, proceed with sign up
    const { user, error } = await signUp({ email, password });

    if (error) {
      toast({ title: "Sign Up Failed", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // Create the profile using the new user's ID
    if (user?.id) {
      const { error: profileError } = await createProfile({ userId: user.id });
      if (profileError) {
        toast({ title: "Profile Creation Failed", description: profileError.message, variant: "destructive" });
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    toast({ title: "Success", description: "Email has been sent to verify your account" });
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <Card className="w-full max-w-md shadow-lg border-0 rounded-xl">
        <CardHeader>
          <CardTitle className="text-center">Sign Up</CardTitle>
          <CardDescription className="text-center">
            Create your account to get started with BetterBooks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
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
            <Input
              type="password"
              placeholder="Confirm Password"
              value={confirm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirm(e.target.value)}
              required
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Signing Up..." : "Sign Up"}
            </Button>
          </form>
          <div className="flex flex-col items-center gap-2 mt-6">
            <span className="text-xs text-muted-foreground">Already have an account?</span>
            <Link to="/login" className="text-blue-600 hover:underline text-sm">
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 