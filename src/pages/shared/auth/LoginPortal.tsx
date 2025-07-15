import { Link } from "react-router-dom";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/shared/components/Card";
import { Button } from "@/shared/components/Button";

export default function LoginPortal() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-900">
            <div className="w-full max-w-4xl px-6">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">BetterBooks</h1>
                    <p className="text-gray-300">Choose your login portal</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* User Portal */}
                    <Card className="shadow-lg border border-gray-700 bg-gray-800 rounded-xl hover:shadow-xl transition-shadow">
                        <CardHeader className="text-center pb-4">
                            <div className="mx-auto mb-4 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <CardTitle className="text-xl text-white">User Portal</CardTitle>
                            <CardDescription className="text-gray-300">
                                Access your financial dashboard and documents
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <ul className="text-sm text-gray-300 mb-6 space-y-2">
                                <li>• Upload invoices and expenses</li>
                                <li>• View financial reports</li>
                                <li>• Company setup</li>
                                <li>• AI suggestions</li>
                            </ul>
                            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                <Link to="/login" target="_blank">Access User Portal</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Accountant Portal */}
                    <Card className="shadow-lg border border-gray-700 bg-gray-800 rounded-xl hover:shadow-xl transition-shadow">
                        <CardHeader className="text-center pb-4">
                            <div className="mx-auto mb-4 w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <CardTitle className="text-xl text-white">Accountant Portal</CardTitle>
                            <CardDescription className="text-gray-300">
                                Manage client accounts and reviews
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <ul className="text-sm text-gray-300 mb-6 space-y-2">
                                <li>• Client management</li>
                                <li>• Document reviews</li>
                                <li>• Financial reports</li>
                                <li>• Billing & invoicing</li>
                            </ul>
                            <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white">
                                <Link to="/accountant/login" target="_blank">Access Accountant Portal</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Admin Portal */}
                    <Card className="shadow-lg border border-gray-700 bg-gray-800 rounded-xl hover:shadow-xl transition-shadow">
                        <CardHeader className="text-center pb-4">
                            <div className="mx-auto mb-4 w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <CardTitle className="text-xl text-white">Admin Portal</CardTitle>
                            <CardDescription className="text-gray-300">
                                System administration and management
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <ul className="text-sm text-gray-300 mb-6 space-y-2">
                                <li>• User management</li>
                                <li>• System settings</li>
                                <li>• Analytics & reports</li>
                                <li>• Security & logs</li>
                            </ul>
                            <Button asChild className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                                <Link to="/admin/login" target="_blank">Access Admin Portal</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
} 