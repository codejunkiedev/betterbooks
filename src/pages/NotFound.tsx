import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <Card className="w-full max-w-md shadow-lg border-0 rounded-xl">
        <CardHeader>
          <CardTitle className="text-center text-4xl">404</CardTitle>
          <CardDescription className="text-center text-xl">
            Page Not Found
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <p className="text-center text-muted-foreground">
            The page you are looking for doesn't exist or has been moved.
          </p>
          <Button asChild>
            <Link to="/">Go Back Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 