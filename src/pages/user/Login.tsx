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

                if (userRole !== 'USER') {
                    toast({
                        title: 'Access Denied',
                        description: 'This login portal is for users only.',
                        variant: 'destructive',
                    });
                    return;
                }

                toast({
                    title: 'Success',
                    description: 'Welcome back!',
                });
                navigate('/');
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
                        <div className="inline-flex items-center px-3 py-1 bg-blue-50 border border-blue-200 rounded-full mb-4">
                            <div className="h-2 w-2 bg-blue-500 rounded-full mr-2"></div>
                            <span className="text-sm font-medium text-blue-700">User Portal</span>
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                        <p className="text-gray-600 text-sm lg:text-base">Sign in to your BetterBooks account</p>
                    </div>

                    {/* Login Form */}
                    <Card className="p-6 lg:p-8 shadow-lg border border-gray-200">
                        <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
                            <div className="space-y-1">
                                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="h-10 lg:h-12 px-3 lg:px-4 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                                    placeholder="Enter your email address"
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
                                    className="h-10 lg:h-12 px-3 lg:px-4 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                                    placeholder="Enter your password"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                        Remember me
                                    </label>
                                </div>
                                <Link
                                    to="/forgot-password"
                                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
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
                                        Signing in...
                                    </div>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>
                        </form>

                        {/* Sign Up Section */}
                        <div className="mt-6 lg:mt-8">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-gray-500">New to BetterBooks?</span>
                                </div>
                            </div>

                            <div className="mt-4 lg:mt-6">
                                <Link
                                    to="/signup"
                                    className="w-full flex justify-center items-center py-2 lg:py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                                >
                                    Create your account
                                </Link>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Right Side - Logo and Details */}
            <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                <div className="max-w-lg text-center w-full">
                    <div className="mb-8">
                        <img
                            src={logo}
                            alt="BetterBooks"
                            className="h-20 w-auto mx-auto mb-6"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                            onLoad={() => { }}
                        />
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">BetterBooks</h2>
                        <p className="text-lg sm:text-xl text-gray-600 mb-6 lg:mb-8">
                            Your Complete Accounting Solution
                        </p>
                    </div>

                    <div className="space-y-4 lg:space-y-6">
                        <div className="flex items-center text-left">
                            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Smart Analytics</h3>
                                <p className="text-gray-600">Get insights into your business performance with advanced reporting</p>
                            </div>
                        </div>

                        <div className="flex items-center text-left">
                            <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Secure & Reliable</h3>
                                <p className="text-gray-600">Bank-level security to protect your financial data</p>
                            </div>
                        </div>

                        <div className="flex items-center text-left">
                            <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Lightning Fast</h3>
                                <p className="text-gray-600">Process transactions and generate reports in seconds</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login; 