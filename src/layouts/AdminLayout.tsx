import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, Shield, Building2, ShieldCheck, Settings, User, LogOut,
  Menu, X, ChevronLeft, ChevronRight, Tag, MessageCircle, FileText, UserCog,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import ProfileDropdown from "@/components/ProfileDropdown";
import { useAuth } from "@/lib/auth";
import { useThemeCustomizer } from "@/contexts/ThemeCustomizerContext";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
  { icon: Users, label: "Giao dịch viên", path: "/admin/traders", highlight: true },
  { icon: Tag, label: "Danh mục", path: "/admin/categories" },
  { icon: Shield, label: "Giao dịch trung gian", path: "/admin/transactions", highlight: true },
  { icon: Building2, label: "Ngân hàng", path: "/admin/banks" },
  { icon: ShieldCheck, label: "Quỹ bảo hiểm", path: "/admin/insurance" },
  { icon: MessageCircle, label: "Facebook Admin", path: "/admin/facebook-contacts" },
  { icon: FileText, label: "Điều khoản", path: "/admin/terms" },
  { icon: UserCog, label: "Quản lý User", path: "/admin/users" },
  { icon: Settings, label: "Cấu hình", path: "/admin/settings" },
  { icon: User, label: "Profile", path: "/admin/profile" },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, signOut, isLoading } = useAuth();
  const { systemSettings } = useThemeCustomizer();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      navigate("/login");
      return;
    }
    if (!isAdmin) {
      navigate("/");
      return;
    }
  }, [user, isAdmin, isLoading, navigate]);

  if (isLoading || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border flex items-center gap-2">
        {systemSettings.logo_url ? (
          <img src={systemSettings.logo_url} alt={systemSettings.site_name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center btn-glow flex-shrink-0">
            <span className="text-primary-foreground font-bold text-lg">{systemSettings.site_name.charAt(0)}</span>
          </div>
        )}
        {!collapsed && <span className="text-lg font-bold text-foreground whitespace-nowrap">{systemSettings.site_name}</span>}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin">
        {menuItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => { navigate(item.path); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? item.highlight
                    ? "bg-primary/20 text-primary border border-primary/40 shadow-[0_0_10px_hsla(330,100%,55%,0.2)]"
                    : "bg-primary/15 text-primary"
                  : item.highlight
                    ? "text-muted-foreground hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/30"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              }`}
            >
              <item.icon size={20} className="flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
          <LogOut size={20} className="flex-shrink-0" />
          {!collapsed && <span>Đăng xuất</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border h-16">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 text-muted-foreground hover:text-foreground" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <button className="hidden md:flex p-2 text-muted-foreground hover:text-foreground" onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
            <span className="text-lg font-semibold text-foreground hidden sm:block">{systemSettings.site_name} Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <ProfileDropdown />
          </div>
        </div>
      </header>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-[280px] bg-background border-r border-border md:hidden">
              <div className="absolute top-4 right-4">
                <button onClick={() => setSidebarOpen(false)} className="p-1 text-muted-foreground hover:text-foreground"><X size={20} /></button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <aside className={`hidden md:block fixed top-16 left-0 bottom-0 z-30 bg-background border-r border-border transition-all duration-300 ${collapsed ? "w-[72px]" : "w-[260px]"}`}>
        <SidebarContent />
      </aside>

      <main className={`pt-16 transition-all duration-300 overflow-x-hidden ${collapsed ? "md:pl-[72px]" : "md:pl-[260px]"}`}>
        <div className="p-4 md:p-6 max-w-7xl mx-auto min-w-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
