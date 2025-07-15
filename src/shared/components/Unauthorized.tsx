
import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/Card';
import { Shield, ArrowLeft, Home } from 'lucide-react';

export default function Unauthorized() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
                        <Shield className="w-8 h-8 text-red-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                        Access Denied
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="text-center">
                        <p className="text-gray-600 mb-4">
                            You don't have permission to access this page. Please contact your administrator if you believe this is an error.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Button asChild className="w-full">
                            <Link to="/">
                                <Home className="w-4 h-4 mr-2" />
                                Go to Dashboard
                            </Link>
                        </Button>

                        <Button variant="outline" asChild className="w-full">
                            <Link to="/login">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Login
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 