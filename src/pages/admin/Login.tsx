import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../shared/components/Button';
import { Input } from '../../shared/components/Input';
import { Label } from '../../shared/components/Label';
import { Card } from '../../shared/components/Card';
import { useToast } from '../../shared/hooks/useToast';
import { signIn, getUserRoleFromDB } from '../../shared/services/supabase/auth';
import logo from '../../assets/logo.png';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { user, error } = await signIn({ email, password });

            if (error) {
                toast({
                    title: 'Error',
                    description: error.message,
                    variant: 'destructive',
                });
                return;
            }

            if (user) {
                const userRole = await getUserRoleFromDB(user);

                if (userRole !== 'ADMIN') {
                    toast({
                        title: 'Access Denied',
                        description: 'This login portal is for administrators only.',
                        variant: 'destructive',
                    });
                    return;
                }

                toast({
                    title: 'Success',
                    description: 'Welcome back!',
                });
                navigate('/admin');
            }
        } catch {
            toast({
                title: 'Error',
                description: 'An unexpected error occurred. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col lg:flex-row">
            {/* Left Side - Login Form */}
            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
                <div className="max-w-md w-full space-y-4 lg:space-y-6">
                    {/* Header */}
                    <div className="text-center">
                        <div className="inline-flex items-center px-3 py-1 bg-purple-50 border border-purple-200 rounded-full mb-4">
                            <div className="h-2 w-2 bg-purple-500 rounded-full mr-2"></div>
                            <span className="text-sm font-medium text-purple-700">Admin Portal</span>
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">System Administration</h1>
                        <p className="text-gray-600 text-sm lg:text-base">Secure access to admin dashboard</p>
                    </div>

                    {/* Login Form */}
                    <Card className="p-6 lg:p-8 shadow-lg border border-gray-200">
                        <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
                            <div className="space-y-1">
                                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                    Administrator Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="h-10 lg:h-12 px-3 lg:px-4 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
                                    placeholder="Enter your administrator email"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-10 lg:h-12 px-3 lg:px-4 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
                                    placeholder="Enter your password"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                        Remember me
                                    </label>
                                </div>
                                <Link
                                    to="/forgot-password"
                                    className="text-sm font-medium text-purple-600 hover:text-purple-500"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-10 lg:h-12 bg-black hover:bg-gray-800 text-white font-medium rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-4 w-4 lg:h-5 lg:w-5 border-b-2 border-white mr-2"></div>
                                        Authenticating...
                                    </div>
                                ) : (
                                    'Access Admin Panel'
                                )}
                            </Button>
                        </form>

                        {/* Security Notice */}
                        <div className="mt-6 lg:mt-8">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-gray-500">Security & Support</span>
                                </div>
                            </div>

                            <div className="mt-4 lg:mt-6 space-y-3">
                                <div className="flex items-center p-2 lg:p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                    <svg className="w-4 h-4 lg:w-5 lg:h-5 text-amber-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    <span className="text-sm text-amber-800">Secure admin access only</span>
                                </div>
                                <Link
                                    to="/contact-support"
                                    className="w-full flex justify-center items-center py-2 lg:py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    IT Support
                                </Link>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Right Side - Logo and Details */}
            <div className="flex-1 bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                <div className="max-w-lg text-center w-full">
                    <div className="mb-8">
                        <img
                            src={logo}
                            alt="BetterBooks"
                            className="h-20 w-auto mx-auto mb-6"
                            onError={(e) => {
                                console.log('Logo failed to load');
                                e.currentTarget.style.display = 'none';
                            }}
                            onLoad={() => console.log('Logo loaded successfully')}
                        />
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">BetterBooks</h2>
                        <p className="text-lg sm:text-xl text-gray-600 mb-6 lg:mb-8">
                            Enterprise Administration Center
                        </p>
                    </div>

                    <div className="space-y-4 lg:space-y-6">
                        <div className="flex items-center text-left">
                            <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                                <p className="text-gray-600">Manage users, roles, and permissions across the platform</p>
                            </div>
                        </div>

                        <div className="flex items-center text-left">
                            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">System Analytics</h3>
                                <p className="text-gray-600">Monitor system performance and usage statistics</p>
                            </div>
                        </div>

                        <div className="flex items-center text-left">
                            <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Security Controls</h3>
                                <p className="text-gray-600">Advanced security settings and audit trail management</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login; 