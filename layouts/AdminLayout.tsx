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
  { icon: Users, label: "Giao dịch viên", path: "/admin/traders" },
  { icon: Tag, label: "Danh mục", path: "/admin/categories" },
  { icon: Shield, label: "Giao dịch trung gian", path: "/admin/transactions" },
  { icon: Building2, label: "Ngân hàng", path: "/admin/banks" },
  { icon: ShieldCheck, label: "Quỹ bảo hiểm", path: "/admin/insurance" },
  { icon: MessageCircle, label: "Facebook Admin", path: "/admin/facebook" },
  { icon: FileText, label: "Điều khoản", path: "/admin/terms" },
  { icon: UserCog, label: "Quản lý User", path: "/admin/users" },
  { icon: Settings, label: "Cấu hình", path: "/admin/settings" },
  { icon: User, label: "Profile", path: "/admin/profile" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const { user, isAdmin, signOut, isLoading } = useAuth();
  const { systemSettings } = useThemeCustomizer();

  useEffect(() => {
    if (isLoading) return;

    if (!user) router.replace("/login");
    if (!isAdmin) router.replace("/");
  }, [user, isAdmin, isLoading]);

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  if (isLoading || !user || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

const SidebarContent = () => {
  return (
    <div className="flex flex-col h-full">

      {/* HEADER */}
      <div className="p-4 border-b border-border flex items-center gap-3">
        <img
          src={systemSettings.logo_url}
          className="w-10 h-10 rounded-lg"
        />

        {!collapsed && (
          <span className="font-bold text-lg">
            {systemSettings.site_name}
          </span>
        )}
      </div>

      {/* MENU */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">

        {menuItems.map((item) => {
          const active = pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
                active
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:bg-accent/50"
              }`}
            >
              <item.icon size={20} />

              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}

      </div>

      {/* LOGOUT */}
      <div className="border-t border-border p-3 mt-auto">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-red-500 rounded-xl hover:bg-red-500/10"
        >
          <LogOut size={20} />
          {!collapsed && "Đăng xuất"}
        </button>
      </div>

    </div>
  );
};

  return (
    <div className="flex flex-col h-screen bg-background">

      {/* HEADER */}
      <header className="h-16 border-b border-border flex items-center justify-between px-4">

        <div className="flex items-center gap-3">

          <button
            className="md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>

          <button
            className="hidden md:block"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </button>

          <span className="font-semibold text-lg">
            {systemSettings.site_name} Admin
          </span>

        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <ProfileDropdown />
        </div>

      </header>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">

        {/* DESKTOP SIDEBAR */}
        <aside
          className={`hidden md:flex flex-col border-r border-border bg-background transition-all duration-300 ${
            collapsed ? "w-20" : "w-64"
          }`}
        >
          <SidebarContent />
        </aside>

        {/* MAIN */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>

      </div>

      {/* MOBILE SIDEBAR */}
      <AnimatePresence>

        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />

            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] bg-background border-r border-border z-50 md:hidden"
            >
              <div className="absolute right-4 top-4">
                <button onClick={() => setSidebarOpen(false)}>
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
}