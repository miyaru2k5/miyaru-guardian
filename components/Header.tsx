"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Home, FileText, User, MessageCircle } from "lucide-react";

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

  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <>
      {/* ================= HEADER ================= */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">

            {/* LOGO */}
            <Link href="/" className="flex items-center gap-2">

              {systemSettings.logo_url ? (
                <>
                  {/* Logo 2:1 + bo tròn */}
                  <div className="h-12 w-24 rounded-xl overflow-hidden flex items-center justify-center bg-background border border-border">
                    <img
                      src={systemSettings.logo_url}
                      alt={systemSettings.site_name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Site name luôn hiển thị */}
                  <span
                    className="text-lg font-bold truncate"
                    style={{ color: siteNameColor }}
                  >
                    {systemSettings.site_name}
                  </span>
                </>
              ) : (
                <>
                  {/* Fallback icon */}
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-lg">
                      {systemSettings.site_name?.charAt(0)}
                    </span>
                  </div>

                  {/* Site name */}
                  <span
                    className="text-lg font-bold"
                    style={{ color: siteNameColor }}
                  >
                    {systemSettings.site_name}
                  </span>
                </>
              )}

            </Link>


            {/* DESKTOP NAV */}
            <nav className="hidden md:flex items-center gap-2">

              <NavItem
                href="/"
                icon={<Home size={16} />}
                label="Trang chủ"
                active={pathname === "/"}
              />



              {/* GDV nổi bật */}
              <NavItem
                href="/giao-dich-vien"
                icon={<Users size={16} />}
                label="Giao dịch viên"
                active={isActive("/giao-dich-vien")}

              />
              <NavItem
                href="/contact"
                icon={<MessageCircle size={16} />}
                label="Liên hệ"
                active={isActive("/bai-viet")}
              />
              {/* Ẩn khi màn nhỏ */}
              <div className="hidden lg:block">
                <NavItem
                  href="/dieu-khoan"
                  icon={<FileText size={16} />}
                  label="Điều khoản"
                  active={isActive("/dieu-khoan")}
                />
              </div>

              <div className="flex items-center gap-2 ml-3 pl-3 border-l border-border">
                <ThemeToggle />
                <ProfileDropdown />
              </div>

            </nav>

            {/* MOBILE RIGHT */}
            <div className="flex md:hidden items-center gap-2">
              <ThemeToggle />
              <ProfileDropdown />
            </div>

          </div>
        </div>
      </header>

      {/* ================= MOBILE BOTTOM NAV ================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border pb-[env(safe-area-inset-bottom)]">

        <div className="relative grid grid-cols-5 items-center h-16">

          <MobileItem
            href="/"
            icon={<Home size={20} />}
            label="Trang chủ"
            active={pathname === "/"}
          />

          <MobileItem
            href="/contact"
            icon={<MessageCircle size={20} />}
            label="Liên hệ"
            active={isActive("/bai-viet")}
          />

          {/* GDV CENTER BUTTON */}
          <div className="relative flex justify-center">
            <Link
              href="/giao-dich-vien"
              className="absolute -top-12 flex flex-col items-center"
            >
              <div
                className={`w-16 h-16 rounded-full shadow-xl border-4 border-background flex flex-col items-center justify-center
                ${isActive("/giao-dich-vien")
                    ? "bg-primary text-white"
                    : "bg-primary text-white"
                  }`}
              >
                <Users size={24} />
                <span className="text-[10px] font-semibold leading-none">
                  GDV
                </span>
              </div>
            </Link>
          </div>

          <MobileItem
            href="/dieu-khoan"
            icon={<FileText size={20} />}
            label="Điều khoản"
            active={isActive("/dieu-khoan")}
          />

          <MobileItem
            href={user ? "/profile" : "/login"}
            icon={<User size={20} />}
            label="Hồ sơ"
            active={isActive("/profile") || isActive("/login")}
          />

        </div>

      </nav>
    </>
  );
};

export default Header;



/* ================= NAV ITEM ================= */

const NavItem = ({
  href,
  icon,
  label,
  active,
  highlight,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  highlight?: boolean;
}) => {
  return (
    <Link
      href={href}
      className={`
        px-4 py-2 rounded-full border flex items-center gap-2 font-medium
        transition whitespace-nowrap

        ${highlight
          ? "bg-primary text-white border-primary shadow-md"
          : active
            ? "bg-primary text-white border-primary"
            : "border-border hover:text-primary hover:border-primary"
        }
      `}
    >
      {icon}
      {label}
    </Link>
  );
};



/* ================= MOBILE ITEM ================= */

const MobileItem = ({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) => {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center text-[11px] gap-1
      ${active ? "text-primary" : "text-muted-foreground"}`}
    >
      {icon}
      <span className="whitespace-nowrap">{label}</span>
    </Link>
  );
};