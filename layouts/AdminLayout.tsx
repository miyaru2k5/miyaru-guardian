"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Shield,
  Building2,
  ShieldCheck,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Tag,
  MessageCircle,
  FileText,
  Newspaper,
  UserCog,
  ShoppingBag,
} from "lucide-react";

import ThemeToggle from "@/components/ThemeToggle";
import ProfileDropdown from "@/components/ProfileDropdown";
import { useAuth } from "@/lib/auth";
import { useThemeCustomizer } from "@/contexts/ThemeCustomizerContext";

const menuItems = [
  { icon: LayoutDashboard, label: "Trang chủ", path: "/admin/dashboard" },
  { icon: Users, label: "Giao dịch viên", path: "/admin/traders" },
  { icon: Tag, label: "Danh mục", path: "/admin/categories" },
  { icon: ShoppingBag, label: "Dịch vụ", path: "/admin/products" },
  { icon: Building2, label: "Ngân hàng", path: "/admin/banks" },
  { icon: ShieldCheck, label: "Bảo chứng", path: "/admin/insurance" },
  { icon: MessageCircle, label: "Liên hệ", path: "/admin/facebook" },
  { icon: FileText, label: "Điều khoản", path: "/admin/terms" },
  { icon: Newspaper, label: "Tin tức", path: "/admin/posts" },
  { icon: UserCog, label: "Tài khoản", path: "/admin/users" },
  { icon: Settings, label: "Cài đặt", path: "/admin/settings" },
];

// ── Tooltip khi sidebar collapsed ──────────────────────────────────────────
const Tooltip = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="relative group/tip">
    {children}
    <div className="
      pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50
      px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap
      bg-popover text-popover-foreground border border-border shadow-md
      opacity-0 group-hover/tip:opacity-100 scale-95 group-hover/tip:scale-100
      transition-all duration-150
    ">
      {label}
      <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-border" />
    </div>
  </div>
);

// ── Sidebar content ─────────────────────────────────────────────────────────
interface SidebarContentProps {
  collapsed: boolean;
  onLogout: () => void;
}

// FIX 1: Bỏ hoàn toàn prop onNavigate — mobile sidebar tự đóng qua useEffect pathname
// FIX 3: React.memo để tránh re-render sidebar không cần thiết khi parent thay đổi state
const SidebarContent = React.memo(({ collapsed, onLogout }: SidebarContentProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { systemSettings } = useThemeCustomizer();

  // FIX 1: handleClick KHÔNG gọi bất kỳ setState nào — router.push chạy ngay lập tức
  const handleClick = (path: string) => {
    router.push(path);
  };

  return (
    <div className="flex flex-col h-full">

      {/* Logo */}
      <div className="shrink-0 h-16 border-b border-border flex items-center gap-3 px-4 overflow-hidden">
        <img
          src={systemSettings.logo_url}
          alt="logo"
          className="w-12 h-12 rounded-lg object-cover shrink-0"
        />
        {/* FIX 2: Thay AnimatePresence + motion.span bằng CSS transition thuần */}
        <span
          className={`
            font-bold text-base whitespace-nowrap overflow-hidden
            transition-all duration-200
            ${collapsed ? "w-0 opacity-0" : "w-auto opacity-100"}
          `}
        >
          <span className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold bg-primary text-white rounded-lg shadow-sm">
            <Shield className="w-4 h-4" />
            ADMIN
          </span>
        </span>
      </div>

      {/* Menu — scrollable */}
      <nav className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-2 py-3 space-y-0.5 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        {menuItems.map((item) => {
          const active = pathname === item.path;

          const btn = (
            <button
              key={item.path}
              onClick={() => handleClick(item.path)}
              className={`
                w-full flex items-center gap-3 rounded-xl text-sm font-medium
                transition-all duration-150 outline-none
                ${collapsed ? "justify-center px-0 py-3" : "px-3 py-2.5"}
                ${active
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                }
              `}
            >
              <item.icon size={19} className="shrink-0" />

              {/* FIX 2: CSS transition thay cho AnimatePresence + motion.span */}
              <span
                className={`
                  truncate whitespace-nowrap overflow-hidden
                  transition-all duration-150
                  ${collapsed ? "w-0 opacity-0" : "w-auto opacity-100"}
                `}
              >
                {item.label}
              </span>

              {/* Active indicator */}
              {active && !collapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              )}
            </button>
          );

          return collapsed
            ? <Tooltip key={item.path} label={item.label}>{btn}</Tooltip>
            : <div key={item.path}>{btn}</div>;
        })}
      </nav>

      {/* Logout */}
      <div className="shrink-0 border-t border-border px-2 py-3">
        {collapsed ? (
          <Tooltip label="Đăng xuất">
            <button
              onClick={onLogout}
              className="w-full flex justify-center items-center py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={19} />
            </button>
          </Tooltip>
        ) : (
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={19} className="shrink-0" />
            <span>Đăng xuất</span>
          </button>
        )}
      </div>

    </div>
  );
});

SidebarContent.displayName = "SidebarContent";

// ── AdminLayout ─────────────────────────────────────────────────────────────
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const { user, isAdmin, signOut, isLoading } = useAuth();
  const { systemSettings } = useThemeCustomizer();

  // Đóng mobile sidebar khi route thay đổi (không cần gọi trong handleClick nữa)
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  useEffect(() => {
    if (isLoading) return;
    if (!user) router.replace("/login");
    if (!isAdmin) router.replace("/");
  }, [user, isAdmin, isLoading]);

  // Block body scroll khi mobile sidebar mở
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

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

  return (
    <div className="flex h-screen overflow-hidden bg-background" style={{ height: "100dvh" }}>

      {/* ── DESKTOP SIDEBAR ── */}
      <aside
        className={`
          hidden md:flex flex-col shrink-0
          h-full overflow-hidden
          border-r border-border bg-background
          transition-[width] duration-300 ease-in-out
          ${collapsed ? "w-[68px]" : "w-64"}
        `}
      >
        <SidebarContent
          collapsed={collapsed}
          onLogout={handleLogout}
        />
      </aside>

      {/* ── RIGHT COLUMN: header + content ── */}
      <div className="flex flex-col flex-1 min-w-0 min-h-0">

        {/* HEADER */}
        <header className="shrink-0 h-16 border-b border-border bg-background/95 backdrop-blur-sm flex items-center justify-between px-4 z-40 relative">

          <div className="flex items-center gap-3 h-12">
            {/* Mobile: hamburger + logo */}
            <div className="flex items-center gap-3 md:hidden">
              <button
                className="transition-transform active:scale-95"
                onClick={() => setSidebarOpen(true)}
                aria-label="Mở menu"
              >
                <div className="p-[2px] rounded-full bg-gradient-to-br from-primary to-primary/30">
                  <div className="p-2 rounded-full bg-card hover:bg-accent/60 transition-colors">
                    <Menu size={20} className="text-primary" />
                  </div>
                </div>
              </button>

              <img
                src={systemSettings.logo_url}
                alt="logo"
                className="h-14 w-auto object-contain shrink-0"
              />
            </div>

            {/* Desktop: icon collapse */}
            <button
              className="hidden md:flex transition-transform active:scale-95"
              onClick={() => setCollapsed(v => !v)}
              aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
            >
              <div className="p-[2px] rounded-full bg-gradient-to-br from-primary to-primary/30">
                <div className="p-2 rounded-full bg-card hover:bg-accent/60 transition-colors">
                  {collapsed ? (
                    <ChevronRight size={18} className="text-primary" />
                  ) : (
                    <ChevronLeft size={18} className="text-primary" />
                  )}
                </div>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <ProfileDropdown />
          </div>
        </header>

        {/* MAIN — chỉ khu vực này scroll */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>

      {/* ── MOBILE SIDEBAR overlay ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />

            {/* Drawer */}
            <motion.aside
              key="drawer"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-background border-r border-border z-50 md:hidden flex flex-col"
            >
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute right-3 top-5 p-4 rounded-lg hover:bg-accent/60 transition-colors z-10"
                aria-label="Đóng menu"
              >
                <X size={30} />
              </button>

              <SidebarContent
                collapsed={false}
                onLogout={handleLogout}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}