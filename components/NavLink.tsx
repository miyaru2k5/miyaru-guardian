"use client";

import Link, { LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavLinkProps extends LinkProps {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

const NavLink = ({ className, activeClassName, href, ...props }: NavLinkProps) => {
  const pathname = usePathname();
  const target = typeof href === "string" ? href : href?.toString();
  const isActive = target ? pathname === target : false;
  return (
    <Link
      href={href}
      className={cn(className, isActive && activeClassName)}
      {...props}
    />
  );
};

export { NavLink };
