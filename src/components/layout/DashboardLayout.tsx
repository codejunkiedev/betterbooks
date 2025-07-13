import { useEffect, useState, useCallback, useMemo, memo } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { setUser } from "@/store/userSlice";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";
import { getCompanyByUserId } from "@/lib/supabase/company";
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
import { Menu, ChevronLeft, LogOut } from "lucide-react";
import logo from "@/assets/logo.png";
import userAvatar from "@/assets/user-avatar.jpeg";
import { NAVIGATION_ITEMS, UI_CONFIG } from "@/constants";
import { Company, UserRole } from "@/types";

// Memoized loading component
const LoadingSpinner = memo(() => (
  <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
));

// Memoized company warning banner
const CompanyWarningBanner = memo(() => (
  <div className="fixed top-5 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-md hidden md:flex items-center z-50 shadow-sm">
    <p className="text-sm text-red-400 flex items-center gap-2">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      Please complete your company profile
    </p>
  </div>
));

// Memoized user dropdown
const UserDropdown = memo(({ userState, onLogout }: { userState: RootState['user']; onLogout: () => void }) => (
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
          <p className="text-sm font-medium leading-none text-gray-900">{userState.user?.email?.split('@')[0] || 'User'}</p>
          <p className="text-xs leading-none text-gray-500">{userState.user?.email}</p>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator className="my-2" />
      <DropdownMenuItem asChild className="p-2 cursor-pointer rounded-md hover:bg-gray-100 focus:bg-gray-100">
        <Link to="/profile" className="flex items-center">
          <svg className="mr-2 h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-gray-700">Profile</span>
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={onLogout}
        className="p-2 cursor-pointer rounded-md hover:bg-red-50 focus:bg-red-50 text-red-600 focus:text-red-600"
      >
        <div className="flex items-center">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </div>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
));

// Memoized sidebar link component
const SidebarLink = memo(({
  to,
  icon: Icon,
  label,
  active,
  onNavigate,
  isCollapsed = false,
  isDark = false,
  company
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onNavigate: () => void;
  isCollapsed?: boolean;
  isDark?: boolean;
  company?: Company | null;
}) => {
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!company && to !== '/profile') {
      e.preventDefault();
      return;
    }
    onNavigate();
  }, [company, to, onNavigate]);

  const linkClasses = useMemo(() => {
    const baseClasses = `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200`;
    const activeClasses = active
      ? (isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black')
      : (isDark ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-black');
    const collapsedClasses = isCollapsed ? 'justify-center px-0' : '';
    const disabledClasses = !company && to !== '/profile' ? 'opacity-50 cursor-not-allowed' : '';

    return `${baseClasses} ${activeClasses} ${collapsedClasses} ${disabledClasses}`.trim();
  }, [active, isDark, isCollapsed, company, to]);

  const iconClasses = useMemo(() =>
    `h-5 w-5 ${isDark ? 'text-gray-400 group-hover:text-white' : 'text-gray-600 group-hover:text-black'}`,
    [isDark]
  );

  return (
    <Link
      to={to}
      onClick={handleClick}
      className={linkClasses}
      style={isCollapsed ? { width: '100%', justifyContent: 'center' } : {}}
    >
      <Icon className={iconClasses} />
      {!isCollapsed && <span className="transition-opacity duration-200">{label}</span>}
    </Link>
  );
});

// Memoized sidebar content
const SidebarContent = memo(({
  isActive,
  onNavigate = () => { },
  isCollapsed = false,
  isDark = false,
  company,
  userRole
}: {
  isActive: (href: string) => boolean;
  onNavigate?: () => void;
  isCollapsed?: boolean;
  isDark?: boolean;
  company?: Company | null;
  userRole?: UserRole;
}) => {
  const { toast } = useToast();

  const handleNavigation = useCallback((path: string) => {
    if (!company && path !== '/profile') {
      toast({
        title: "Action Required",
        description: "Please complete your company profile first.",
        variant: "destructive",
      });
      return;
    }
    onNavigate();
  }, [company, toast, onNavigate]);

  // Get navigation items based on user role
  const navigationItems = useMemo(() => {
    switch (userRole) {
      case UserRole.ADMIN:
        return NAVIGATION_ITEMS.ADMIN;
      case UserRole.ACCOUNTANT:
        return NAVIGATION_ITEMS.ACCOUNTANT;
      case UserRole.USER:
      default:
        return NAVIGATION_ITEMS.USER;
    }
  }, [userRole]);

  return (
    <nav className="flex flex-col h-full w-full">
      <div className="flex-1 pt-6 pb-2 px-4 space-y-2">
        {navigationItems.map(({ to, icon, label }) => (
          <SidebarLink
            key={to}
            to={to}
            icon={icon}
            label={label}
            active={isActive(to)}
            onNavigate={() => handleNavigation(to)}
            isCollapsed={isCollapsed}
            isDark={isDark}
            company={company}
          />
        ))}
      </div>
    </nav>
  );
});

// Memoized sidebar collapse button
const SidebarCollapseButton = memo(({
  isCollapsed,
  onToggle
}: {
  isCollapsed: boolean;
  onToggle: () => void;
}) => (
  <div className="flex items-center justify-end px-3 py-2.5 border-t border-gray-800">
    <Button
      variant="ghost"
      size="icon"
      className="group flex items-center rounded-lg p-2 text-sm font-medium transition-all duration-200 text-gray-400 hover:bg-gray-800 hover:text-white h-9 w-9"
      onClick={onToggle}
      aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
    >
      <ChevronLeft className={`h-5 w-5 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`} />
    </Button>
  </div>
));

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const userState = useSelector((state: RootState) => state.user);
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);

  // Memoized active link checker
  const isActive = useCallback((href: string) => location.pathname === href, [location.pathname]);

  // Memoized logout handler
  const handleLogout = useCallback(async () => {
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
  }, [toast, navigate]);

  // Memoized user details fetcher
  const fetchUserDetails = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;

      const user = session?.user;
      if (!session || !user) {
        navigate("/login", { replace: true });
        return;
      }

      const companyData = await getCompanyByUserId(user.id);
      setCompany(companyData);

      dispatch(setUser({ user, session }));
      setIsLoading(false);

      if (!companyData) {
        navigate("/company-setup");
        return;
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
      toast({
        title: "Error",
        description: "Authentication failed. Please log in again.",
        variant: "destructive",
      });
      navigate("/login", { replace: true });
    }
  }, [dispatch, navigate, toast]);

  // Memoized sidebar toggle handlers
  const handleSidebarToggle = useCallback(() => setIsCollapsed(prev => !prev), []);
  const handleMobileMenuClose = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <header className={`sticky top-0 z-40 w-full border-b bg-gray-900 h-${UI_CONFIG.HEADER_HEIGHT / 4} flex items-center px-6 justify-between`}>
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
                <SidebarContent
                  isActive={isActive}
                  onNavigate={handleMobileMenuClose}
                  isDark
                  company={company}
                  userRole={userState.user?.role as UserRole}
                />
              </SheetContent>
            </SheetPortal>
          </Sheet>
          <img src={logo} alt="Logo" className="h-28 w-28" />
        </div>

        {!company && <CompanyWarningBanner />}

        <UserDropdown userState={userState} onLogout={handleLogout} />
      </header>

      <div className="flex h-[calc(100vh-5rem)]">
        {/* Sidebar */}
        <aside className={`hidden md:flex flex-col border-r border-gray-800 bg-gray-900 justify-between transition-all duration-${UI_CONFIG.ANIMATION_DURATION} ${isCollapsed ? `w-${UI_CONFIG.SIDEBAR_WIDTH.COLLAPSED / 4}` : `w-${UI_CONFIG.SIDEBAR_WIDTH.EXPANDED / 4}`}`}>
          <SidebarContent
            isActive={isActive}
            isCollapsed={isCollapsed}
            isDark
            company={company}
            userRole={userState.user?.role as UserRole}
          />
          <SidebarCollapseButton
            isCollapsed={isCollapsed}
            onToggle={handleSidebarToggle}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-white p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default memo(DashboardLayout); 