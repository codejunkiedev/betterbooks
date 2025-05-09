import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { resetPassword } from "@/services/authService";
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({ title: "Error", description: "Email is required.", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);

    if (error) {
      toast({ title: "Reset Failed", description: "Email could not be found or reset failed.", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "If this email is registered, a reset link has been sent." });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <Card className="w-full max-w-md shadow-lg border-0 rounded-xl">
        <CardHeader>
          <CardTitle className="text-center">Forgot Password</CardTitle>
          <CardDescription className="text-center">
            Enter your registered email to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReset} className="space-y-4">
            <Input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
          <div className="flex flex-col items-center gap-2 mt-6">
            <span className="text-xs text-muted-foreground">Remembered your password?</span>
            <Link to="/login" className="text-blue-600 hover:underline text-sm">
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
