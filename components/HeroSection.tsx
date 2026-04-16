"use client";

import { useEffect, useState } from "react";
import { Shield, UserCheck, Headphones, Zap, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useThemeCustomizer } from "@/contexts/ThemeCustomizerContext";

interface InsuranceFund {
  total_fund: number;
  currently_insured: number;
  max_percentage: number;
  safe_trade_percentage: number; // ✅ thêm
}

const HeroSection = () => {
  const { systemSettings } = useThemeCustomizer();
  const siteName = systemSettings.site_name || "Admin";

  const [insuranceFund, setInsuranceFund] = useState<InsuranceFund | null>(null);

  useEffect(() => {
    const fetchInsurance = async () => {
      try {
        const { data } = await supabase
          .from("insurance_fund")
          .select("*")
          .limit(1)
          .maybeSingle();

        if (data) setInsuranceFund(data);
      } catch (err) {
        console.error("Fetch insurance fund failed:", err);
      }
    };

    fetchInsurance();
  }, []);

  // ✅ dynamic safe %
  const safePercent = Number(insuranceFund?.safe_trade_percentage ?? 80);

  const features = [
    { icon: Shield, text: "Được bảo vệ bởi quỹ bảo hiểm" },
    { icon: UserCheck, text: "Xác thực danh tính rõ ràng" },
    { icon: Headphones, text: "Hỗ trợ nhanh chóng" },
    { icon: Zap, text: "Xử lý giao dịch trong vài phút" },
  ];

  return (
    <section className="pt-32 pb-20 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

      <div className="container mx-auto text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-8 animate-fade-in-up">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-primary text-sm font-medium">
            GIAO DỊCH VIÊN
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up">
          Giao dịch viên{" "}
          <span className="text-gradient">Uy tín & Tận tâm</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up">
          Giao dịch minh bạch – bảo chứng bởi quỹ {siteName}
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-4 rounded-xl bg-card/50 border border-border hover:border-primary/30 transition-all card-hover animate-fade-in-up"
              style={{ animationDelay: `${0.3 + index * 0.1}s` }}
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm text-foreground text-left">
                {feature.text}
              </span>
            </div>
          ))}
        </div>

        {/* 🔥 SAFETY RULE (dynamic) */}
        <div className="max-w-3xl mx-auto mb-12 animate-fade-in-up">
          <div className="relative overflow-hidden rounded-2xl border border-amber-300/40 bg-gradient-to-br from-amber-100/60 to-amber-50/30 dark:from-amber-500/10 dark:to-transparent p-6 md:p-8 backdrop-blur">

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.25),transparent_70%)] pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">

              {/* Icon */}
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-400/30">
                  <AlertTriangle className="w-7 h-7 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl animate-pulse" />
              </div>

              {/* Content */}
              <div className="text-center md:text-left flex-1">
                <p className="text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 font-semibold mb-1">
                  Quy tắc an toàn
                </p>

                <h3 className="text-lg md:text-xl font-bold mb-2">
                  Chỉ giao dịch tối đa{" "}
                  <span className="text-amber-600 dark:text-amber-400">
                    {safePercent}%
                  </span>{" "}
                  quỹ bảo hiểm
                </h3>

                <p className="text-sm text-muted-foreground">
                  Giúp giảm thiểu rủi ro và đảm bảo bạn luôn được bảo vệ khi giao dịch với GDV
                </p>

                {/* Progress */}
                <div className="mt-4">
                  <div className="w-full h-2 rounded-full bg-amber-200/40 dark:bg-amber-500/10 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${safePercent}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                    <span>0%</span>
                    <span className="text-amber-600 font-semibold">
                      {safePercent}% an toàn
                    </span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Insurance Stats */}
        {insuranceFund && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto text-left animate-fade-in-up">
            <div className="p-5 rounded-2xl bg-card/60 border border-border">
              <p className="text-sm text-muted-foreground mb-1">
                Tổng quỹ bảo hiểm
              </p>
              <p className="text-lg md:text-xl font-bold text-primary">
                {Number(insuranceFund.total_fund).toLocaleString("vi-VN")}₫
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-card/60 border border-border">
              <p className="text-sm text-muted-foreground mb-1">
                Đang bảo chứng
              </p>
              <p className="text-lg md:text-xl font-bold">
                {Number(insuranceFund.currently_insured).toLocaleString("vi-VN")}₫
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-card/60 border border-border">
              <p className="text-sm text-muted-foreground mb-1">
                Tỷ lệ tối đa / hiện tại
              </p>
              <p className="text-lg md:text-xl font-bold">
                {(
                  (insuranceFund.currently_insured /
                    Math.max(insuranceFund.total_fund, 1)) *
                  100
                ).toFixed(1)}
                % / {insuranceFund.max_percentage}%
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;