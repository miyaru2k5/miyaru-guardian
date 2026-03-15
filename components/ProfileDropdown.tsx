"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Home,
  Users,
  FileText,
  LayoutDashboard,
  Newspaper,
  MessageCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

const ProfileDropdown = () => {
  const [open, setOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const { user, isAdmin, signOut } = useAuth();
  const router = useRouter();

  /* click outside close */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* load avatar */
  useEffect(() => {
    if (!user) {
      setAvatarUrl(null);
      return;
    }

    supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.avatar_url) setAvatarUrl(data.avatar_url);
      });
  }, [user]);

  const go = (path: string) => {
    router.push(path);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      {/* BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-full bg-secondary border border-border flex items-center justify-center hover:border-primary/50 transition-colors overflow-hidden"
      >
        {user ? (
          avatarUrl ? (
            <img src={avatarUrl} className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-bold text-primary">
              {user.user_metadata?.full_name?.charAt(0) ||
                user.email?.charAt(0)?.toUpperCase() ||
                "U"}
            </span>
          )
        ) : (
          <Menu size={18} className="text-muted-foreground" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-60 bg-popover border border-border rounded-xl shadow-xl overflow-hidden z-50"
          >
            {/* ===== HỆ ===== */}
            <div className="px-4 py-2 text-xs font-semibold text-muted-foreground border-b border-border">
              Hệ thống
            </div>

            {/* ADMIN */}
            {isAdmin && (
              <button
                onClick={() => go("/admin/dashboard")}
                className="w-full px-4 py-2.5 flex items-center gap-2 text-sm hover:bg-accent/50"
              >
                <LayoutDashboard size={16} />
                Quản trị hệ thống
              </button>
            )}

            {/* Trang chủ */}
            <button
              onClick={() => go("/")}
              className="w-full px-4 py-2.5 flex items-center gap-2 text-sm hover:bg-accent/50"
            >
              <Home size={16} />
              Trang chủ
            </button>

            {/* Tin tức */}
            <button
              onClick={() => go("/bai-viet")}
              className="w-full px-4 py-2.5 flex items-center gap-2 text-sm hover:bg-accent/50"
            >
              <Newspaper size={16} />
              Tin tức
            </button>

            {/* Giao dịch viên */}
            <button
              onClick={() => go("/giao-dich-vien")}
              className="w-full px-4 py-2.5 flex items-center gap-2 text-sm hover:bg-accent/50"
            >
              <Users size={16} />
              Giao dịch viên
            </button>
            {/* Liên hệ */}
            <button
              onClick={() => go("/contact")}
              className="w-full px-4 py-2.5 flex items-center gap-2 text-sm hover:bg-accent/50"
            >
              <MessageCircle size={16} />
              Liên hệ
            </button>
            {/* Điều khoản */}
            <button
              onClick={() => go("/dieu-khoan")}
              className="w-full px-4 py-2.5 flex items-center gap-2 text-sm hover:bg-accent/50"
            >
              <FileText size={16} />
              Điều khoản
            </button>

            {/* ===== HỒ SƠ ===== */}
            <div className="px-4 py-2 text-xs font-semibold text-muted-foreground border-y border-border mt-1">
              Hồ sơ
            </div>

            {user ? (
              <>
                <div className="px-4 py-3">
                  <p className="text-sm font-medium truncate">
                    {user.user_metadata?.full_name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>

                <button
                  onClick={() => go("/profile")}
                  className="w-full px-4 py-2.5 flex items-center gap-2 text-sm hover:bg-accent/50"
                >
                  <User size={16} />
                  Cài đặt
                </button>

                <button
                  onClick={async () => {
                    await signOut();
                    setOpen(false);
                    router.push("/");
                  }}
                  className="w-full px-4 py-2.5 flex items-center gap-2 text-sm text-destructive hover:bg-destructive/10 border-t border-border"
                >
                  <LogOut size={16} />
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => go("/login")}
                  className="w-full px-4 py-2.5 flex items-center gap-2 text-sm hover:bg-accent/50"
                >
                  <LogIn size={16} />
                  Đăng nhập
                </button>

                <button
                  onClick={() => go("/register")}
                  className="w-full px-4 py-2.5 flex items-center gap-2 text-sm hover:bg-accent/50"
                >
                  <UserPlus size={16} />
                  Đăng ký
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileDropdown;