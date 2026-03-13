"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Home, FileText, User } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import ProfileDropdown from "./ProfileDropdown";
import { useThemeCustomizer } from "@/contexts/ThemeCustomizerContext";
import { useAuth } from "@/lib/auth";

const Header = () => {
  const pathname = usePathname();

  const { user } = useAuth();
  const { systemSettings, currentPrimaryColor } = useThemeCustomizer();

  const primaryColor = currentPrimaryColor || systemSettings.primary_color;
  const siteNameColor = `hsl(${primaryColor})`;

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* TOP HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">

            {/* LOGO */}
            <Link href="/" className="flex items-center gap-2">
              {systemSettings.logo_url ? (
                <img
                  src={systemSettings.logo_url}
                  alt={systemSettings.site_name}
                  className="w-10 h-10 rounded-xl object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">
                    {systemSettings.site_name.charAt(0)}
                  </span>
                </div>
              )}

              <span className="text-xl font-bold" style={{ color: siteNameColor }}>
                {systemSettings.site_name}
              </span>
            </Link>

            {/* DESKTOP MENU */}
            <nav className="hidden md:flex items-center gap-3">

              <Link
                href="/"
                className={`px-5 py-2.5 rounded-full border font-medium transition-colors
                ${
                  isActive("/")
                    ? "bg-primary text-white border-primary"
                    : "border-border text-foreground hover:text-primary hover:border-primary"
                }`}
              >
                Trang chủ
              </Link>

              <Link
                href="/giao-dich-vien"
                className={`px-5 py-2.5 rounded-full border font-medium transition-colors
                ${
                  isActive("/giao-dich-vien")
                    ? "bg-primary text-white border-primary"
                    : "border-border text-foreground hover:text-primary hover:border-primary"
                }`}
              >
                Giao dịch viên
              </Link>

              <Link
                href="/dieu-khoan"
                className={`px-5 py-2.5 rounded-full border font-medium transition-colors
                ${
                  isActive("/dieu-khoan")
                    ? "bg-primary text-white border-primary"
                    : "border-border text-muted-foreground hover:text-primary hover:border-primary"
                }`}
              >
                Điều khoản
              </Link>

              <div className="flex items-center gap-2 ml-2 pl-4 border-l border-border">
                <ThemeToggle />
                <ProfileDropdown />
              </div>

            </nav>

            {/* MOBILE RIGHT */}
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle />
              <ProfileDropdown />
            </div>

          </div>
        </div>
      </header>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border">
        <div className="flex">

          <Link
            href="/"
            className={`flex-1 flex flex-col items-center justify-center py-3 text-sm
            ${isActive("/") ? "text-primary" : "text-muted-foreground"}`}
          >
            <Home size={20} />
            Trang chủ
          </Link>

          <Link
            href="/giao-dich-vien"
            className={`flex-1 flex flex-col items-center justify-center py-3 text-sm
            ${
              isActive("/giao-dich-vien")
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            <Users size={20} />
            GDV
          </Link>

          <Link
            href="/dieu-khoan"
            className={`flex-1 flex flex-col items-center justify-center py-3 text-sm
            ${
              isActive("/dieu-khoan")
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            <FileText size={20} />
            Điều khoản
          </Link>

          <Link
            href={user ? "/profile" : "/login"}
            className={`flex-1 flex flex-col items-center justify-center py-3 text-sm
            ${
              isActive("/profile") || isActive("/login")
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            <User size={20} />
            Hồ sơ
          </Link>

        </div>
      </nav>
    </>
  );
};

export default Header;