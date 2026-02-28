import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";

/**
 * Chỉ hiển thị nội dung khi user chưa đăng nhập.
 * Nếu đã đăng nhập → redirect về / hoặc /admin
 */
const RequireGuest = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (user) {
      navigate(isAdmin ? "/admin/dashboard" : "/", { replace: true });
    }
  }, [user, isAdmin, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) return null;
  return <>{children}</>;
};

export default RequireGuest;
