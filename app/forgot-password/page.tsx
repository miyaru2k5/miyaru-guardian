"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth";
import { getAuthErrorMessage } from "@/lib/authErrors";
import { toast } from "@/hooks/use-toast";
import MainLayout from "@/layouts/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";

const schema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

const ForgotPasswordPage = () => {
  const { resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    setLoading(true);
    const { error } = await resetPassword(data.email);
    setLoading(false);

    if (error) {
      toast({
        title: "Lỗi",
        description: getAuthErrorMessage(error),
        variant: "destructive",
      });
    } else {
      setSent(true);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-8 pt-24">
        <div className="w-full max-w-md">
          <div className="glow-border rounded-2xl p-8">
            {sent ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 text-primary" />
                </div>

                <h2 className="text-xl font-bold text-foreground">
                  Kiểm tra email
                </h2>

                <p className="text-sm text-muted-foreground">
                  Chúng tôi đã gửi link đặt lại mật khẩu vào email của bạn.
                </p>

                {/* 2 nút dưới */}
                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={() => setSent(false)}
                    className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                  >
                    <ArrowLeft size={14} /> Quay lại
                  </button>

                  <Link
                    href="/login"
                    className="text-sm text-primary hover:underline font-medium flex items-center gap-1"
                  >
                    <ArrowLeft size={14} /> Quay lại đăng nhập
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-foreground mb-2">
                    Quên mật khẩu
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    Nhập email để nhận link đặt lại mật khẩu
                  </p>
                </div>

                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Email
                    </label>

                    <div className="relative">
                      <Mail
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      />
                      <Input
                        {...register("email")}
                        type="email"
                        placeholder="Nhập email"
                        className="pl-10"
                        autoFocus
                      />
                    </div>

                    {errors.email && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>


                  <Button
                    type="submit"
                    className="w-full btn-glow flex items-center justify-center gap-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4" />
                    )}
                    {loading ? "Đang gửi..." : "Gửi link đặt lại"}
                  </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground mt-6">
                  <Link
                    href="/login"
                    className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                  >
                    <ArrowLeft size={14} /> Quay lại đăng nhập
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ForgotPasswordPage;
