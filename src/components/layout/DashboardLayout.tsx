import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger, SheetPortal, SheetOverlay } from "@/components/ui/sheet";
import { Menu, Home, Upload, Sparkles, User, ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const DashboardLayout = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { toast } = useToast();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 w-full border-b bg-gray-100 h-16 flex items-center px-6 justify-between">
        <div className="flex items-center gap-3">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6 text-black" />
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
          <span className="font-bold text-xl text-black tracking-tight">BetterBooks</span>
        </div>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9 border border-gray-300">
                  <AvatarImage src="/avatars/01.png" alt="User" />
                  <AvatarFallback className="bg-gray-200 text-black">P</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">User</p>
                  <p className="text-xs leading-none text-muted-foreground">user@example.com</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex items-center cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="flex items-center text-red-600 focus:text-red-600 cursor-pointer">
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" /></svg>
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside className={`hidden md:flex flex-col border-r border-gray-800 bg-gray-900 h-full justify-between transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-60'}`}>
          <div>
            <div className="flex h-16 items-center justify-end border-b border-gray-800 px-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white"
                onClick={() => setIsCollapsed(!isCollapsed)}
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <ChevronLeft className={`h-5 w-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
              </Button>
            </div>
            <SidebarContent isActive={isActive} isCollapsed={isCollapsed} isDark />
          </div>
        </aside>
        {/* Main Content */}
        <main className="flex-1 min-h-0 bg-white p-6 overflow-y-auto">
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
function SidebarContent({ isActive, onNavigate = () => {}, isCollapsed = false, isDark = false }: SidebarContentProps) {
  return (
    <nav className="flex flex-col h-full w-full">
      <div className="flex-1 pt-6 pb-2 px-4">
        <SidebarLink to="/" icon={<Home className={`h-5 w-5 ${isDark ? 'text-white' : 'text-black'}`} />} label="Home" active={isActive("/")} onNavigate={onNavigate} isCollapsed={isCollapsed} isDark={isDark} />
        <SidebarLink to="/upload" icon={<Upload className={`h-5 w-5 ${isDark ? 'text-white' : 'text-black'}`} />} label="Upload Document" active={isActive("/upload")} onNavigate={onNavigate} isCollapsed={isCollapsed} isDark={isDark} />
        <SidebarLink to="/ai-suggestion" icon={<Sparkles className={`h-5 w-5 ${isDark ? 'text-white' : 'text-black'}`} />} label="AI Suggestion" active={isActive("/ai-suggestion")} onNavigate={onNavigate} isCollapsed={isCollapsed} isDark={isDark} />
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
};
function SidebarLink({ to, icon, label, active, onNavigate, isCollapsed = false, isDark = false }: SidebarLinkProps) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${active ? (isDark ? 'bg-white text-black' : 'bg-black text-white') : (isDark ? 'text-white hover:bg-gray-800' : 'text-black hover:bg-gray-100')} ${isCollapsed ? 'justify-center px-0' : ''}`}
      style={isCollapsed ? { width: '100%', justifyContent: 'center' } : {}}
    >
      {icon}
      {!isCollapsed && <span>{label}</span>}
    </Link>
  );
}

export default DashboardLayout; 