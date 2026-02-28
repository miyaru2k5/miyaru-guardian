import { useState, useRef, useEffect } from "react";
import { User, LogOut, LogIn, UserPlus, Settings, LayoutDashboard, Home } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

const ProfileDropdown = () => {
  const [open, setOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!user) { setAvatarUrl(null); return; }
    supabase.from("profiles").select("avatar_url").eq("id", user.id).maybeSingle()
      .then(({ data }) => { if (data?.avatar_url) setAvatarUrl(data.avatar_url); });
  }, [user]);

  const go = (path: string) => { navigate(path); setOpen(false); };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-full bg-secondary border border-border flex items-center justify-center hover:border-primary/50 transition-colors overflow-hidden"
      >
        {user ? (
          avatarUrl ? (
            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-bold text-primary">
              {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || "U"}
            </span>
          )
        ) : (
          <User size={18} className="text-muted-foreground" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-52 bg-popover border border-border rounded-xl shadow-xl overflow-hidden z-50"
          >
            {user ? (
              <>
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-medium text-foreground truncate">{user.user_metadata?.full_name || "User"}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                {isAdmin ? (
                  <>
                    <button onClick={() => go("/admin/dashboard")} className="w-full px-4 py-2.5 flex items-center gap-2 text-sm text-foreground hover:bg-accent/50 transition-colors">
                      <LayoutDashboard size={16} /> Admin Dashboard
                    </button>
                    <button onClick={() => go("/")} className="w-full px-4 py-2.5 flex items-center gap-2 text-sm text-foreground hover:bg-accent/50 transition-colors">
                      <Home size={16} /> Trang chủ
                    </button>
                    <button onClick={() => go("/admin/profile")} className="w-full px-4 py-2.5 flex items-center gap-2 text-sm text-foreground hover:bg-accent/50 transition-colors">
                      <Settings size={16} /> Cài đặt
                    </button>
                  </>
                ) : (
                  <button onClick={() => go("/admin/profile")} className="w-full px-4 py-2.5 flex items-center gap-2 text-sm text-foreground hover:bg-accent/50 transition-colors">
                    <User size={16} /> Trang cá nhân
                  </button>
                )}
                <button onClick={async () => { await signOut(); setOpen(false); navigate("/"); }} className="w-full px-4 py-2.5 flex items-center gap-2 text-sm text-destructive hover:bg-destructive/10 transition-colors border-t border-border">
                  <LogOut size={16} /> Đăng xuất
                </button>
              </>
            ) : (
              <>
                <button onClick={() => go("/login")} className="w-full px-4 py-2.5 flex items-center gap-2 text-sm text-foreground hover:bg-accent/50 transition-colors">
                  <LogIn size={16} /> Đăng nhập
                </button>
                <button onClick={() => go("/register")} className="w-full px-4 py-2.5 flex items-center gap-2 text-sm text-foreground hover:bg-accent/50 transition-colors">
                  <UserPlus size={16} /> Đăng ký
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
