import { BadgeCheck, type LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

/** Role verification badge — Lucide only (replaces tick PNG/GIF). */
const ROLE_CLASS: Record<string, string> = {
  gdv: "text-sky-500",
  admin: "text-fuchsia-500",
  kdv: "text-amber-500",
  default: "text-primary",
};

type Props = LucideProps & {
  role?: string | null;
};

export function VerifiedBadge({
  role,
  className,
  size = 16,
  ...props
}: Props) {
  const color =
    (role && ROLE_CLASS[role]) || ROLE_CLASS.default;
  return (
    <BadgeCheck
      size={size}
      className={cn("shrink-0", color, className)}
      aria-label="Đã xác thực"
      {...props}
    />
  );
}

export default VerifiedBadge;
