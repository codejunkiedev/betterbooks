import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/shared/hooks';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { Label } from '@/shared/components/Label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/Card';
import { Alert, AlertDescription } from '@/shared/components/Alert';
import { LoadingSpinner } from '@/shared/components/Loading';
import { Eye, EyeOff, Lock, CheckCircle, ArrowRight } from 'lucide-react';

export const ResetPassword: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { confirmPasswordReset, isLoading, error, clearError } = useAuth();

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    // Get token from URL params
    const token = searchParams.get('token');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (localError || error) {
            setLocalError(null);
            clearError();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        // Basic validation
        if (!formData.password || !formData.confirmPassword) {
            setLocalError('Please fill in all fields');
            return;
        }

        if (formData.password.length < 8) {
            setLocalError('Password must be at least 8 characters long');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setLocalError('Passwords do not match');
            return;
        }

        if (!token) {
            setLocalError('Invalid reset token. Please request a new password reset.');
            return;
        }

        try {
            const result = await confirmPasswordReset({
                token,
                password: formData.password
            });

            if (result.success) {
                setIsSuccess(true);
            } else {
                setLocalError(result.error || 'Failed to reset password');
            }
        } catch {
            setLocalError('An unexpected error occurred');
        }
    };

    const displayError = localError || error;

    // If no token, show error
    if (!token) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <Card className="shadow-xl">
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-2xl font-semibold text-center text-red-600">
                                Invalid Reset Link
                            </CardTitle>
                            <CardDescription className="text-center">
                                This password reset link is invalid or has expired.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <Link
                                to="/forgot-password"
                                className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline"
                            >
                                Request a new password reset
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">BetterBooks</h1>
                    <p className="text-gray-600">Reset your password</p>
                </div>

                {/* Reset Password Card */}
                <Card className="shadow-xl">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-semibold text-center">
                            {isSuccess ? 'Password Reset Successfully' : 'Set New Password'}
                        </CardTitle>
                        <CardDescription className="text-center">
                            {isSuccess
                                ? 'Your password has been updated successfully'
                                : 'Enter your new password below'
                            }
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {isSuccess ? (
                            /* Success State */
                            <div className="text-center space-y-4">
                                <div className="flex justify-center">
                                    <CheckCircle className="h-12 w-12 text-green-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        Password Updated
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        Your password has been successfully reset. You can now sign in with your new password.
                                    </p>
                                </div>
                                <Button
                                    onClick={() => navigate('/login')}
                                    className="w-full"
                                >
                                    Sign In
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            /* Form State */
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Error Alert */}
                                {displayError && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{displayError}</AlertDescription>
                                    </Alert>
                                )}

                                {/* Password Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="password">New Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Enter your new password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className="pl-10 pr-10"
                                            disabled={isLoading}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                            disabled={isLoading}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500">Must be at least 8 characters</p>
                                </div>

                                {/* Confirm Password Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="Confirm your new password"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            className="pl-10 pr-10"
                                            disabled={isLoading}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                            disabled={isLoading}
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <LoadingSpinner size="sm" />
                                            <span className="ml-2">Updating password...</span>
                                        </>
                                    ) : (
                                        'Update Password'
                                    )}
                                </Button>
                            </form>
                        )}

                        {/* Back to Login Link */}
                        {!isSuccess && (
                            <div className="text-center mt-6">
                                <Link
                                    to="/login"
                                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                    Back to login
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-xs text-gray-500">
                        Remember your password?{' '}
                        <Link to="/login" className="hover:underline">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}; 