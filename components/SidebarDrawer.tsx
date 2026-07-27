"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Home,
    MessageCircle,
    Sparkles,
    ShieldCheck,
    Users,
    LogIn,
    LogOut,
} from "lucide-react";

import { useThemeCustomizer } from "@/contexts/ThemeCustomizerContext";
import { useAuth } from "@/lib/auth";

// ── Types ────────────────────────────────────────────────────────────────────
interface NavLink {
    href: string;
    label: string;
    icon: React.ReactNode;
}

interface NavSection {
    title: string;
    links: NavLink[];
}

// ── Nav config ───────────────────────────────────────────────────────────────
const sections: NavSection[] = [
    {
        title: "Hệ thống",
        links: [
            { href: "/", label: "Trang chủ", icon: <Home size={17} /> },
            { href: "/giao-dich-vien", label: "Giao dịch viên", icon: <Users size={17} /> },
            { href: "/contact", label: "Liên hệ", icon: <MessageCircle size={17} /> },
        ],
    },
    {
        title: "Tiện ích",
        links: [
            { href: "/get-2fa", label: "Lấy mã 2FA", icon: <ShieldCheck size={17} /> },
            { href: "/get-uid-fb", label: "Lấy UID Facebook", icon: <Sparkles size={17} /> },
        ],
    },
];

// ── Props ────────────────────────────────────────────────────────────────────
interface SidebarDrawerProps {
    open: boolean;
    onClose: () => void;
}

// ── Component ────────────────────────────────────────────────────────────────
const SidebarDrawer = ({ open, onClose }: SidebarDrawerProps) => {
    const pathname = usePathname();
    const { systemSettings, currentPrimaryColor } = useThemeCustomizer();
    const { user, signOut } = useAuth();
    const router = useRouter();

    const primaryColor = currentPrimaryColor || systemSettings.primary_color;
    const siteNameColor = `hsl(${primaryColor})`;

    // FIX: Dùng ref để lưu pathname trước đó
    // Chỉ gọi onClose() SAU KHI pathname thực sự đã thay đổi (tức là navigate xong)
    // Tránh gọi setState đồng thời với router.push gây delay
    const prevPathname = useRef(pathname);
    useEffect(() => {
        if (prevPathname.current !== pathname) {
            prevPathname.current = pathname;
            onClose();
        }
    }, [pathname]);

    // Khoá scroll body khi mở
    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    const isActive = (href: string) =>
        href === "/" ? pathname === "/" : pathname.startsWith(href);

    // FIX: Logout không gọi onClose() trước router.push
    // onClose() sẽ tự chạy sau khi pathname thay đổi (qua useEffect ở trên)
    const handleLogout = async () => {
        await signOut();
        router.push("/");
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* ── Backdrop ── */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* ── Drawer ── */}
                    <motion.aside
                        key="drawer"
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", stiffness: 340, damping: 34 }}
                        className="
                            fixed left-0 top-0 bottom-0 z-50
                            w-72 flex flex-col
                            bg-background border-r border-border
                            shadow-2xl
                        "
                    >
                        {/* Header */}
                        <div className="h-16 shrink-0 flex items-center justify-between px-4 border-b border-border">
                            <Link href="/" className="flex items-center gap-2 min-w-0">
                                {systemSettings.logo_url ? (
                                    <>
                                        <div className="h-14 flex items-center shrink-0">
                                            <img
                                                src={systemSettings.logo_url}
                                                alt={systemSettings.site_name}
                                                className="h-full w-auto object-contain"
                                            />
                                        </div>
                                        <span className="text-base font-bold truncate" style={{ color: siteNameColor }}>
                                            {systemSettings.site_name}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shrink-0">
                                            <span className="text-primary-foreground font-bold text-base">
                                                {systemSettings.site_name?.charAt(0)}
                                            </span>
                                        </div>
                                        <span className="text-base font-bold truncate" style={{ color: siteNameColor }}>
                                            {systemSettings.site_name}
                                        </span>
                                    </>
                                )}
                            </Link>

                            <button
                                onClick={onClose}
                                className="p-1.5 rounded-lg hover:bg-accent/60 transition-colors shrink-0"
                                aria-label="Đóng menu"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        {/* Nav sections — scrollable */}
                        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-5 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                            {sections.map((section) => (
                                <div key={section.title}>
                                    <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                                        {section.title}
                                    </p>

                                    <ul className="space-y-0.5">
                                        {section.links.map((link) => {
                                            const active = isActive(link.href);
                                            return (
                                                <li key={`${link.href}-${link.label}`}>
                                                    {/* FIX: Bỏ onClick={onClose} trên Link
                                                        — không gọi setState ngay khi click
                                                        — onClose tự chạy sau khi pathname đổi */}
                                                    <Link
                                                        href={link.href}
                                                        className={`
                                                            flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                                                            transition-all duration-150
                                                            ${active
                                                                ? "bg-primary/15 text-primary"
                                                                : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                                                            }
                                                        `}
                                                    >
                                                        <span className={`shrink-0 ${active ? "text-primary" : "text-muted-foreground"}`}>
                                                            {link.icon}
                                                        </span>
                                                        <span className="truncate">{link.label}</span>
                                                        {active && (
                                                            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                                        )}
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            ))}
                        </nav>

                        {/* Footer — login / logout */}
                        <div className="shrink-0 border-t border-border px-3 py-3">
                            {user ? (
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                                >
                                    <LogOut size={17} className="shrink-0" />
                                    <span>Đăng xuất</span>
                                </button>
                            ) : (
                                // FIX: Bỏ onClick={onClose} — tự đóng qua useEffect
                                <Link
                                    href="/login"
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
                                >
                                    <LogIn size={17} className="shrink-0" />
                                    <span>Đăng nhập</span>
                                </Link>
                            )}
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
};

export default SidebarDrawer;