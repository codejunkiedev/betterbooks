import { useState, useEffect, useCallback } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { useToast } from "@/shared/hooks/useToast";
import { supabase } from "@/shared/services/supabase/client";
import { getCompanyByUserId } from "@/shared/services/supabase/company";
import { useAppSelector } from "@/shared/hooks/useRedux";
import { Button } from "@/shared/components/Button";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { NotificationBadge } from "@/shared/components/NotificationBadge";
import { useModules } from "@/shared/hooks/useModules";

interface Company {
    id: string;
    name: string;
    type: string;
    user_id: string;
    is_active: boolean;
    created_at: string;
}
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/Avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/shared/components/DropdownMenu";
import {
    Sheet,
    SheetContent,
    SheetOverlay,
    SheetPortal,
    SheetTrigger,
} from "@/shared/components/Sheet";
import { Menu, Home, Upload, User, ChevronLeft, FileText, BookOpen, BarChart3, MessageCircle } from "lucide-react";
import logo from "@/assets/logo.png";
import userAvatar from "@/assets/user-avatar.jpeg";

const UserLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAppSelector(state => state.user);
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [company, setCompany] = useState<Company | null>(null);

    const fetchCompanyDetails = useCallback(async () => {
        if (!user) return;

        try {
            const companyData = await getCompanyByUserId(user.id);
            setCompany(companyData);
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching company details:", error);
            toast({
                title: "Error",
                description: "Failed to load company details.",
                variant: "destructive",
            });
            setIsLoading(false);
        }
    }, [user, toast]);

    useEffect(() => {
        fetchCompanyDetails();
    }, [fetchCompanyDetails]);

    // Helper for active link
    const isActive = (href: string) => location.pathname === href;

    // Logout handler
    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            toast({
                title: "Error",
                description: "Failed to logout. Please try again.",
                variant: "destructive",
            });
        } else {
            toast({
                title: "Success",
                description: "Logged out successfully.",
            });
            navigate("/login");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Top Bar */}
            <header className="sticky top-0 z-40 w-full border-b bg-gray-900 h-20 flex items-center px-6 justify-between">
                <div className="flex items-center gap-3">
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-6 w-6 text-white" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetPortal>
                            <SheetOverlay className="z-[100]" />
                            <SheetContent side="left" className="z-[101] w-[240px] p-0 bg-gray-900 border-r border-gray-800">
                                <SidebarContent isActive={isActive} onNavigate={() => setIsOpen(false)} isDark />
                            </SheetContent>
                        </SheetPortal>
                    </Sheet>
                    <img src={logo} alt="Logo" className="h-28 w-28" />
                </div>
                {!company && (
                    <div className="fixed top-5 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-md hidden md:flex items-center z-50 shadow-sm">
                        <p className="text-sm text-red-400 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Please complete your company profile
                        </p>
                    </div>
                )}
                <div className="flex items-center gap-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                <Avatar className="h-9 w-9 border border-gray-700">
                                    <AvatarImage src={userAvatar} alt="User Avatar" />
                                    <AvatarFallback className="bg-gray-700 text-white">U</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-64 p-2" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal p-2">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none text-gray-900">{user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}</p>
                                    <p className="text-xs leading-none text-gray-500">{user?.email}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="my-2" />
                            <DropdownMenuItem asChild className="p-2 cursor-pointer rounded-md hover:bg-gray-100 focus:bg-gray-100">
                                <Link to="/profile" className="flex items-center">
                                    <User className="mr-2 h-4 w-4 text-gray-500" />
                                    <span className="text-gray-700">Profile</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="p-2 cursor-pointer rounded-md hover:bg-red-50 focus:bg-red-50 text-red-600 focus:text-red-600"
                            >
                                <div className="flex items-center">
                                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
                                    </svg>
                                    <span>Log out</span>
                                </div>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            <div className="flex h-[calc(100vh-5rem)]">
                {/* Sidebar */}
                <aside className={`hidden md:flex flex-col border-r border-gray-800 bg-gray-900 justify-between transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
                    <SidebarContent isActive={isActive} isCollapsed={isCollapsed} isDark />
                    <div className="flex items-center justify-end px-3 py-2.5 border-t border-gray-800">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="group flex items-center rounded-lg p-2 text-sm font-medium transition-all duration-200 text-gray-400 hover:bg-gray-800 hover:text-white h-9 w-9"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        >
                            <ChevronLeft className={`h-5 w-5 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`} />
                        </Button>
                    </div>
                </aside>
                {/* Main Content */}
                <main className="flex-1 bg-white p-6 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

type SidebarContentProps = {
    isActive: (href: string) => boolean;
    onNavigate?: () => void;
    isCollapsed?: boolean;
    isDark?: boolean;
};
function SidebarContent({ isActive, onNavigate = () => { }, isCollapsed = false, isDark = false }: SidebarContentProps) {
    const { unreadCount } = useNotifications();
    const { hasAccounting, accountingTier } = useModules();

    const handleNavigation = () => {
        onNavigate();
    };

    return (
        <nav className="flex flex-col h-full w-full">
            <div className="flex-1 pt-6 pb-2 px-4 space-y-2">
                <SidebarLink
                    to="/"
                    icon={<Home className={`h-5 w-5 ${isDark ? 'text-gray-400 group-hover:text-white' : 'text-gray-600 group-hover:text-black'}`} />}
                    label="Home"
                    active={isActive("/")}
                    onNavigate={handleNavigation}
                    isCollapsed={isCollapsed}
                    isDark={isDark}
                    notificationCount={unreadCount}
                />
                {hasAccounting && (
                    <SidebarLink
                        to="/upload"
                        icon={<Upload className={`h-5 w-5 ${isDark ? 'text-gray-400 group-hover:text-white' : 'text-gray-600 group-hover:text-black'}`} />}
                        label="Upload Documents"
                        active={isActive("/upload")}
                        onNavigate={handleNavigation}
                        isCollapsed={isCollapsed}
                        isDark={isDark}
                    />
                )}
                {hasAccounting && (
                    <SidebarLink
                        to="/documents"
                        icon={<FileText className={`h-5 w-5 ${isDark ? 'text-gray-400 group-hover:text-white' : 'text-gray-600 group-hover:text-black'}`} />}
                        label="Documents"
                        active={isActive("/documents")}
                        onNavigate={handleNavigation}
                        isCollapsed={isCollapsed}
                        isDark={isDark}
                    />
                )}
                {hasAccounting && (
                    <SidebarLink
                        to="/journal"
                        icon={<BookOpen className={`h-5 w-5 ${isDark ? 'text-gray-400 group-hover:text-white' : 'text-gray-600 group-hover:text-black'}`} />}
                        label="Journal"
                        active={isActive("/journal")}
                        onNavigate={handleNavigation}
                        isCollapsed={isCollapsed}
                        isDark={isDark}
                    />
                )}
                {hasAccounting && accountingTier === 'Advanced' && (
                    <SidebarLink
                        to="/reports"
                        icon={<BarChart3 className={`h-5 w-5 ${isDark ? 'text-gray-400 group-hover:text-white' : 'text-gray-600 group-hover:text-black'}`} />}
                        label="Reports"
                        active={isActive("/reports")}
                        onNavigate={handleNavigation}
                        isCollapsed={isCollapsed}
                        isDark={isDark}
                    />
                )}
                <SidebarLink
                    to="/messages"
                    icon={<MessageCircle className={`h-5 w-5 ${isDark ? 'text-gray-400 group-hover:text-white' : 'text-gray-600 group-hover:text-black'}`} />}
                    label="Messages"
                    active={isActive("/messages")}
                    onNavigate={handleNavigation}
                    isCollapsed={isCollapsed}
                    isDark={isDark}
                    notificationCount={unreadCount}
                />

            </div>
        </nav>
    );
}

type SidebarLinkProps = {
    to: string;
    icon: React.ReactNode;
    label: string;
    active: boolean;
    onNavigate: () => void;
    isCollapsed?: boolean;
    isDark?: boolean;
    notificationCount?: number;
};
function SidebarLink({ to, icon, label, active, onNavigate, isCollapsed = false, isDark = false, notificationCount }: SidebarLinkProps) {
    const handleClick = () => {
        onNavigate();
    };

    return (
        <Link
            to={to}
            onClick={handleClick}
            className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${active
                ? (isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black')
                : (isDark ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-black')
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
            style={isCollapsed ? { width: '100%', justifyContent: 'center' } : {}}
        >
            <div className="relative">
                {icon}
                {notificationCount && notificationCount > 0 && (
                    <NotificationBadge count={notificationCount} />
                )}
            </div>
            {!isCollapsed && <span className="transition-opacity duration-200">{label}</span>}
        </Link>
    );
}

export default UserLayout; 