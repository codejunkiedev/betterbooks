
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/shared/hooks/useRedux';
import { supabase } from '@/shared/services/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { AlertTriangle, LogOut, Building } from 'lucide-react';
import logo from '@/assets/logo.png';

export default function Blocked() {
    const navigate = useNavigate();
    const { currentCompany } = useAppSelector(state => state.company);

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (!error) {
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                        <img src={logo} alt="Logo" className="h-16 w-16" />
                    </div>
                    <CardTitle className="text-xl text-gray-900">Account Temporarily Suspended</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-center p-3 bg-red-50 rounded-lg">
                        <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
                        <span className="text-red-700 font-medium">Access Restricted</span>
                    </div>

                    <div className="text-center space-y-3">
                        <p className="text-gray-600">
                            Your account has been temporarily suspended by your accountant.
                        </p>

                        {currentCompany && (
                            <div className="flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-lg">
                                <Building className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-600">
                                    {currentCompany.name}
                                </span>
                            </div>
                        )}

                        <p className="text-sm text-gray-500">
                            All your data is preserved and will be restored once your account is reactivated.
                            Please contact your accountant for more information.
                        </p>
                    </div>

                    <div className="pt-4">
                        <Button
                            onClick={handleLogout}
                            variant="outline"
                            className="w-full"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign Out
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 