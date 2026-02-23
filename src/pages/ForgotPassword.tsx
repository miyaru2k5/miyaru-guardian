import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";
import AuthLayout from "@/layouts/AuthLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft } from "lucide-react";

const schema = z.object({ email: z.string().email("Email không hợp lệ") });

const ForgotPassword = () => {
  const { resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    setLoading(true);
    const { error } = await resetPassword(data.email);
    setLoading(false);
    if (error) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <div className="glow-border rounded-2xl p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Kiểm tra email</h2>
              <p className="text-sm text-muted-foreground">Chúng tôi đã gửi link đặt lại mật khẩu vào email của bạn.</p>
              <Link to="/login" className="text-primary hover:underline text-sm font-medium inline-flex items-center gap-1">
                <ArrowLeft size={14} /> Quay lại đăng nhập
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-foreground mb-2">Quên mật khẩu</h1>
                <p className="text-muted-foreground text-sm">Nhập email để nhận link đặt lại mật khẩu</p>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input {...register("email")} placeholder="Email" className="pl-10" />
                  </div>
                  {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
                </div>
                <Button type="submit" className="w-full btn-glow" disabled={loading}>
                  {loading ? "Đang gửi..." : "Gửi link đặt lại"}
                </Button>
              </form>
              <p className="text-center text-sm text-muted-foreground mt-6">
                <Link to="/login" className="text-primary hover:underline font-medium inline-flex items-center gap-1">
                  <ArrowLeft size={14} /> Quay lại đăng nhập
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
