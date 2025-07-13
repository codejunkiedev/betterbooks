import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sheet,
    SheetContent,
    SheetOverlay,
    SheetPortal,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, Home, Upload, User, FileText } from "lucide-react";
import logo from "@/assets/logo.png";
import userAvatar from "@/assets/user-avatar.jpeg";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

const SimpleLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const userState = useSelector((state: RootState) => state.user);
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);

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

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Bar */}
            <header className="sticky top-0 z-40 w-full h-12 flex items-center px-3 justify-between bg-gray-900 shadow-sm border-b border-gray-800">
                <div className="flex items-center gap-2">
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-5 w-5 text-white" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetPortal>
                            <SheetOverlay className="z-[100]" />
                            <SheetContent side="left" className="z-[101] w-40 p-0 bg-gray-800 border-r border-gray-700 shadow-lg">
                                <SidebarContent isActive={isActive} onNavigate={() => setIsOpen(false)} />
                            </SheetContent>
                        </SheetPortal>
                    </Sheet>
                    <img src={logo} alt="Logo" className="h-8 w-8" />
                    <span className="font-bold text-base text-white hidden md:block">BetterBooks</span>
                </div>
                <div className="flex items-center gap-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                <Avatar className="h-8 w-8 border border-gray-700">
                                    <AvatarImage src={userAvatar} alt="User Avatar" />
                                    <AvatarFallback className="bg-gray-800 text-white">U</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-48 p-2 bg-gray-900 border border-gray-800 text-white" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal p-2 text-white">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none text-white">{userState.user?.email}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="my-2 bg-gray-800" />
                            <DropdownMenuItem asChild className="p-2 cursor-pointer rounded-md hover:bg-gray-800 focus:bg-gray-800 text-white">
                                <Link to="/profile" className="flex items-center">
                                    <User className="mr-2 h-4 w-4 text-gray-400" />
                                    <span className="text-white">Profile</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="p-2 cursor-pointer rounded-md hover:bg-red-900 focus:bg-red-900 text-red-400 focus:text-red-400"
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

            <div className="flex flex-1 min-h-0">
                {/* Sidebar */}
                <aside className="hidden md:flex flex-col w-40 border-r border-gray-700 bg-gray-800 shadow-sm py-3 px-1 space-y-1">
                    <SidebarContent isActive={isActive} />
                </aside>
                {/* Main Content */}
                <main className="flex-1 bg-gray-50 p-4 md:p-6 overflow-y-auto rounded-md">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

type SidebarContentProps = {
    isActive: (href: string) => boolean;
    onNavigate?: () => void;
};

function SidebarContent({ isActive, onNavigate = () => { } }: SidebarContentProps) {
    return (
        <nav className="flex flex-col gap-1">
            <SidebarLink
                to="/dashboard"
                icon={<Home className="h-5 w-5" />}
                label="Home"
                active={isActive("/dashboard")}
                onNavigate={() => onNavigate()}
            />
            <SidebarLink
                to="/upload"
                icon={<Upload className="h-5 w-5" />}
                label="Upload Documents"
                active={isActive("/upload")}
                onNavigate={() => onNavigate()}
            />
            <SidebarLink
                to="/documents"
                icon={<FileText className="h-5 w-5" />}
                label="Documents"
                active={isActive("/documents")}
                onNavigate={() => onNavigate()}
            />
            <SidebarLink
                to="/profile"
                icon={<User className="h-5 w-5" />}
                label="Profile"
                active={isActive("/profile")}
                onNavigate={() => onNavigate()}
            />
        </nav>
    );
}

type SidebarLinkProps = {
    to: string;
    icon: React.ReactNode;
    label: string;
    active: boolean;
    onNavigate: () => void;
};

function SidebarLink({ to, icon, label, active, onNavigate }: SidebarLinkProps) {
    return (
        <Link
            to={to}
            onClick={onNavigate}
            className={`group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ${active
                ? 'bg-gray-700 text-white'
                : 'text-gray-200 hover:bg-gray-700 hover:text-white'
                }`}
        >
            {icon}
            <span className="transition-opacity duration-200">{label}</span>
        </Link>
    );
}

export default SimpleLayout; 