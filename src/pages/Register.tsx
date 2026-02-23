import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";
import AuthLayout from "@/layouts/AuthLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";

const schema = z.object({
  fullName: z.string().min(2, "Họ tên ít nhất 2 ký tự").max(100),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu ít nhất 6 ký tự"),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Mật khẩu không khớp",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

const Register = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const { error } = await signUp(data.email, data.password, data.fullName);
    setLoading(false);
    if (error) {
      toast({ title: "Lỗi đăng ký", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Đăng ký thành công", description: "Vui lòng kiểm tra email để xác thực tài khoản." });
      navigate("/login");
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <div className="glow-border rounded-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">Đăng ký</h1>
            <p className="text-muted-foreground text-sm">Tạo tài khoản Miyaru Admin</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input {...register("fullName")} placeholder="Họ tên" className="pl-10" />
              </div>
              {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName.message}</p>}
            </div>

            <div>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input {...register("email")} placeholder="Email" className="pl-10" />
              </div>
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input {...register("password")} type={showPw ? "text" : "password"} placeholder="Mật khẩu" className="pl-10 pr-10" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input {...register("confirmPassword")} type={showPw ? "text" : "password"} placeholder="Xác nhận mật khẩu" className="pl-10" />
              </div>
              {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <Button type="submit" className="w-full btn-glow" disabled={loading}>
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Đã có tài khoản? <Link to="/login" className="text-primary hover:underline font-medium">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Register;
