"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Shield,
  Building2,
  ShieldCheck,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Tag,
  MessageCircle,
  FileText,
  UserCog,
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
  { icon: MessageCircle, label: "Facebook Admin", path: "/admin/facebook" },
  { icon: FileText, label: "Điều khoản", path: "/admin/terms" },
  { icon: UserCog, label: "Quản lý User", path: "/admin/users" },
  { icon: Settings, label: "Cấu hình", path: "/admin/settings" },
  { icon: User, label: "Profile", path: "/admin/profile" },
];

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAdmin, signOut, isLoading } = useAuth();
  const { systemSettings } = useThemeCustomizer();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!isAdmin) {
      router.replace("/");
    }
  }, [user, isAdmin, isLoading, router]);

  if (isLoading || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Prevent body scrolling while mobile sidebar is open
    document.body.style.overflow = sidebarOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  useEffect(() => {
    // Close mobile sidebar when navigating to a new page
    setSidebarOpen(false);
  }, [pathname]);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border flex items-center gap-2">
        {systemSettings.logo_url ? (
          <img
            src={systemSettings.logo_url}
            alt={systemSettings.site_name}
            className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center btn-glow flex-shrink-0">
            <span className="text-primary-foreground font-bold text-lg">
              {systemSettings.site_name.charAt(0)}
            </span>
          </div>
        )}
        {!collapsed && (
          <span className="text-lg font-bold text-foreground whitespace-nowrap">
            {systemSettings.site_name}
          </span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin">
        {menuItems.map((item) => {
          const active = pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => {
                router.push(item.path);
                setSidebarOpen(false);
              }}
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
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut size={20} className="flex-shrink-0" />
          {!collapsed && <span>Đăng xuất</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-40 h-16 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="flex h-full items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 text-muted-foreground hover:text-foreground"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu size={24} />
            </button>

            <button
              className="hidden md:flex p-2 text-muted-foreground hover:text-foreground"
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>

            <span className="hidden sm:block text-lg font-semibold text-foreground">
              {systemSettings.site_name} Admin
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <ProfileDropdown />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden min-h-0">
        <aside
          className={`hidden md:flex flex-col border-r border-border bg-background transition-all duration-300 min-h-0 ${
            collapsed ? "w-20" : "w-64"
          }`}
        >
          <SidebarContent />
        </aside>

        <main className="flex-1 min-h-0 overflow-auto">
          <div className="p-4 md:p-6 max-w-[1600px] mx-auto w-full min-w-0">
            {children}
          </div>
        </main>
      </div>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-[280px] bg-background border-r border-border md:hidden"
            >
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 text-muted-foreground hover:text-foreground"
                >
                  <X size={20} />
                </button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminLayout;
