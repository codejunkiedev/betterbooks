import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/hooks';
import { Button } from '@/shared/components/button';
import { Input } from '@/shared/components/input';
import { Label } from '@/shared/components/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/card';
import { Alert, AlertDescription } from '@/shared/components/alert';
import { LoadingSpinner } from '@/shared/components/loading';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/select';
import { Eye, EyeOff, Mail, Lock, User, Building, ArrowRight, Check } from 'lucide-react';

const COMPANY_TYPES = [
    { value: 'INDEPENDENT_WORKER', label: 'Independent Worker' },
    { value: 'PROFESSIONAL_SERVICES', label: 'Professional Services' },
    { value: 'SMALL_BUSINESS', label: 'Small Business' }
];

export const SignUp: React.FC = () => {
    const navigate = useNavigate();
    const { register, isLoading, error, clearError } = useAuth();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        companyName: '',
        companyType: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);
    const [step, setStep] = useState<'account' | 'company'>('account');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (localError || error) {
            setLocalError(null);
            clearError();
        }
    };

    const handleSelectChange = (value: string) => {
        setFormData(prev => ({ ...prev, companyType: value }));
    };

    const validateAccountStep = () => {
        if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
            setLocalError('Please fill in all fields');
            return false;
        }

        if (!formData.email.includes('@')) {
            setLocalError('Please enter a valid email address');
            return false;
        }

        if (formData.password.length < 8) {
            setLocalError('Password must be at least 8 characters long');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setLocalError('Passwords do not match');
            return false;
        }

        return true;
    };

    const handleAccountStep = () => {
        if (validateAccountStep()) {
            setStep('company');
            setLocalError(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        if (!validateAccountStep()) {
            return;
        }

        if (!formData.companyName || !formData.companyType) {
            setLocalError('Please fill in all company information');
            return;
        }

        try {
            const result = await register({
                email: formData.email,
                password: formData.password,
                fullName: formData.fullName
            });

            if (result.success) {
                // Redirect to company setup or dashboard
                navigate('/company-setup', { replace: true });
            } else {
                setLocalError(result.error || 'Registration failed');
            }
        } catch {
            setLocalError('An unexpected error occurred');
        }
    };

    const displayError = localError || error;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">BetterBooks</h1>
                    <p className="text-gray-600">Create your account</p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-6">
                    <div className="flex items-center space-x-4">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${step === 'account' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-500'
                            }`}>
                            {step === 'account' ? '1' : <Check className="h-4 w-4" />}
                        </div>
                        <div className="w-12 h-0.5 bg-gray-300"></div>
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${step === 'company' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-500'
                            }`}>
                            2
                        </div>
                    </div>
                </div>

                {/* Signup Card */}
                <Card className="shadow-xl">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-semibold text-center">
                            {step === 'account' ? 'Create Account' : 'Company Information'}
                        </CardTitle>
                        <CardDescription className="text-center">
                            {step === 'account'
                                ? 'Set up your personal account details'
                                : 'Tell us about your business'
                            }
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Error Alert */}
                            {displayError && (
                                <Alert variant="destructive">
                                    <AlertDescription>{displayError}</AlertDescription>
                                </Alert>
                            )}

                            {step === 'account' ? (
                                /* Account Step */
                                <>
                                    {/* Full Name Field */}
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Full Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="fullName"
                                                name="fullName"
                                                type="text"
                                                placeholder="Enter your full name"
                                                value={formData.fullName}
                                                onChange={handleInputChange}
                                                className="pl-10"
                                                disabled={isLoading}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Email Field */}
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                placeholder="Enter your email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="pl-10"
                                                disabled={isLoading}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Password Field */}
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="password"
                                                name="password"
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="Create a password"
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
                                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                placeholder="Confirm your password"
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

                                    {/* Next Button */}
                                    <Button
                                        type="button"
                                        onClick={handleAccountStep}
                                        className="w-full"
                                        disabled={isLoading}
                                    >
                                        Next Step
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </>
                            ) : (
                                /* Company Step */
                                <>
                                    {/* Company Name Field */}
                                    <div className="space-y-2">
                                        <Label htmlFor="companyName">Company Name</Label>
                                        <div className="relative">
                                            <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="companyName"
                                                name="companyName"
                                                type="text"
                                                placeholder="Enter your company name"
                                                value={formData.companyName}
                                                onChange={handleInputChange}
                                                className="pl-10"
                                                disabled={isLoading}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Company Type Field */}
                                    <div className="space-y-2">
                                        <Label htmlFor="companyType">Company Type</Label>
                                        <Select value={formData.companyType} onValueChange={handleSelectChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select your company type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {COMPANY_TYPES.map((type) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Back Button */}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setStep('account')}
                                        className="w-full"
                                        disabled={isLoading}
                                    >
                                        Back
                                    </Button>

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <LoadingSpinner size="sm" />
                                                <span className="ml-2">Creating account...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Create Account</span>
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                </>
                            )}
                        </form>

                        {/* Sign In Link */}
                        <div className="text-center mt-6">
                            <p className="text-sm text-gray-600">
                                Already have an account?{' '}
                                <Link
                                    to="/login"
                                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-xs text-gray-500">
                        By creating an account, you agree to our{' '}
                        <Link to="/terms" className="hover:underline">Terms of Service</Link>
                        {' '}and{' '}
                        <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}; 