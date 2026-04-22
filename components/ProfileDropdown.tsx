"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Menu, User, LogOut, LogIn, UserPlus,
  Home, Users, FileText, LayoutDashboard,
  Newspaper, MessageCircle,
  Sparkles, ShieldCheck,
  Wallet,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const ProfileDropdown = () => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const { user, isAdmin, signOut } = useAuth();
  const router = useRouter();

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

  const go = (path: string) => router.push(path);

  return (
    <DropdownMenu>
      {/* Trigger */}
      <DropdownMenuTrigger asChild>
        <button className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors border border-border">
          <User size={20} className="text-primary" />
        </button>
      </DropdownMenuTrigger>

      {/* Content */}
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-60 rounded-2xl p-0 overflow-hidden"
      >

        {/* ===== HỒ SƠ ===== */}
        <DropdownMenuLabel className="px-4 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Hồ sơ
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-0" />

        {user ? (
          <>
            {/* User info */}
            <div className="px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-primary">
                    {user.user_metadata?.full_name?.charAt(0) ||
                      user.email?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.user_metadata?.full_name || "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>

            <DropdownMenuSeparator className="my-0" />

            {isAdmin && (
              <Item icon={<LayoutDashboard size={15} />} label="Quản trị hệ thống" onClick={() => go("/admin/dashboard")} />
              
            )}
            <Item icon={<Home size={15} />} label="Trang chủ" onClick={() => go("/")} />
            <Item icon={<User size={15} />} label="Trang cá nhân" onClick={() => go("/profile")} />
            <Item icon={<Wallet size={15} />} label="Nạp tiền" onClick={() => go("/bankings")} />
            <DropdownMenuSeparator className="my-0" />

            <DropdownMenuItem
              onClick={async () => {
                await signOut();
                router.push("/");
              }}
              className="px-4 py-2.5 gap-2.5 text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
            >
              <LogOut size={15} />
              Đăng xuất
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <Item icon={<LogIn size={15} />} label="Đăng nhập" onClick={() => go("/login")} />
            <Item icon={<UserPlus size={15} />} label="Đăng ký" onClick={() => go("/register")} />
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const Item = ({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) => (
  <DropdownMenuItem
    onClick={onClick}
    className="px-4 py-2.5 gap-2.5 cursor-pointer"
  >
    <span className="text-muted-foreground shrink-0">{icon}</span>
    {label}
  </DropdownMenuItem>
);

export default ProfileDropdown;
