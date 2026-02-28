import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import MainLayout from "@/layouts/MainLayout";
import { CheckCircle } from "lucide-react";

/**
 * Trang xử lý sau khi user bấm "Xác minh email" trong email.
 * Supabase redirect về đây kèm #access_token=... - client tự xử lý và tạo session.
 */
const AuthConfirm = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Đang xác minh email...");

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) {
      // Không có hash - có thể đã verify rồi hoặc link sai
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setStatus("success");
          setMessage("Email đã được xác minh! Đang chuyển hướng...");
        } else {
          setStatus("error");
          setMessage("Liên kết không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập hoặc đăng ký lại.");
        }
      });
      return;
    }

    // Có hash - Supabase client sẽ tự parse và set session qua onAuthStateChange
    const timer = setTimeout(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user?.email_confirmed_at) {
          setStatus("success");
          setMessage("Email đã được xác minh! Đang chuyển hướng...");
        } else if (session?.user) {
          setStatus("success");
          setMessage("Đã xác minh! Đang chuyển hướng...");
        } else {
          setStatus("error");
          setMessage("Không thể xác minh. Vui lòng thử lại hoặc kiểm tra link trong email.");
        }
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (status === "success" && user) {
      const t = setTimeout(() => {
        navigate(isAdmin ? "/admin/dashboard" : "/", { replace: true });
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [status, user, isAdmin, navigate]);

  const goToLogin = () => navigate("/login");
  const goToHome = () => navigate("/");

  return (
    <MainLayout>
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-8 pt-24">
        <div className="w-full max-w-md text-center">
          <div className="glow-border rounded-2xl p-8">
            {status === "loading" && (
              <>
                <div className="w-16 h-16 mx-auto mb-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <h1 className="text-xl font-bold text-foreground mb-2">Đang xác minh email</h1>
                <p className="text-muted-foreground text-sm">{message}</p>
              </>
            )}
            {status === "success" && (
              <>
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <CheckCircle size={40} className="text-primary" />
                </div>
                <h1 className="text-xl font-bold text-foreground mb-2">Xác minh thành công!</h1>
                <p className="text-muted-foreground text-sm mb-6">{message}</p>
                <p className="text-xs text-muted-foreground">Bạn sẽ được chuyển đến trang chủ...</p>
              </>
            )}
            {status === "error" && (
              <>
                <h1 className="text-xl font-bold text-foreground mb-2">Không thể xác minh</h1>
                <p className="text-muted-foreground text-sm mb-6">{message}</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={goToLogin}
                    className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition"
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={goToHome}
                    className="px-4 py-2 rounded-xl border border-border text-foreground font-medium hover:bg-accent/50 transition"
                  >
                    Về trang chủ
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AuthConfirm;
