"use client";

import { useEffect, useState } from "react";
import {
  Shield,
  UserCheck,
  Headphones,
  Zap,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useThemeCustomizer } from "@/contexts/ThemeCustomizerContext";

interface InsuranceFund {
  total_fund: number;
  currently_insured: number;
  max_percentage: number;
  safe_trade_percentage: number;
  banner1?: string;
  banner2?: string;
  link_banner1?: string;
  link_banner2?: string;
}

const HeroSection = () => {
  const { systemSettings } = useThemeCustomizer();
  const siteName = systemSettings.site_name || "Admin";

  const [insuranceFund, setInsuranceFund] =
    useState<InsuranceFund | null>(null);

  useEffect(() => {
    const fetchInsurance = async () => {
      const { data } = await supabase
        .from("insurance_fund")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (data) setInsuranceFund(data);
    };

    fetchInsurance();
  }, []);

  // ✅ FIX LINK
  const getValidLink = (url?: string) => {
    if (!url) return "#";
    if (!/^https?:\/\//i.test(url)) return `https://${url}`;
    return url;
  };

  const safePercent = Number(
    insuranceFund?.safe_trade_percentage ?? 80
  );

  const features = [
    { icon: Shield, text: "Được bảo vệ bởi quỹ bảo hiểm" },
    { icon: UserCheck, text: "Xác thực danh tính rõ ràng" },
    { icon: Headphones, text: "Hỗ trợ nhanh chóng" },
    { icon: Zap, text: "Xử lý giao dịch nhanh chóng" },
  ];

  return (
    <section className="pt-24 md:pt-32 pb-16 md:pb-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 text-center">

        {/* HEADER */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-primary text-sm font-medium">
              GIAO DỊCH VIÊN
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 leading-tight">
            Giao dịch viên{" "}
            <span className="text-gradient">Uy tín & Tận tâm</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Giao dịch minh bạch – bảo chứng bởi quỹ {siteName}
          </p>
        </div>

        {/* BANNER 1 */}
        {insuranceFund?.banner1 && (
          <a
            href={getValidLink(insuranceFund.link_banner1)}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full mb-10"
          >
            <img
              src={insuranceFund.banner1}
              className="w-full h-[120px] sm:h-[140px] md:h-[160px] object-cover rounded-2xl border shadow-sm hover:scale-[1.02] transition"
            />
          </a>
        )}

        {/* FEATURES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-4 rounded-xl bg-card/60 border border-border hover:border-primary/30 transition"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>

              <span className="text-sm text-left leading-snug">
                {feature.text}
              </span>
            </div>
          ))}
        </div>

        {/* BANNER 2 + SAFETY */}
        <div className="flex flex-col lg:flex-row gap-6 mb-12 items-stretch">

          {/* Banner 2 */}
          {insuranceFund?.banner2 && (
            <a
              href={getValidLink(insuranceFund.link_banner2)}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full lg:w-[320px] flex-shrink-0"
            >
              <img
                src={insuranceFund.banner2}
                className="w-full h-auto max-h-[120px] object-cover rounded-2xl border shadow-sm hover:opacity-90 transition"
              />
            </a>
          )}

          {/* SAFETY */}
          <div className="flex-1 rounded-2xl border border-amber-300/40 bg-gradient-to-br from-amber-100/60 to-transparent dark:from-amber-500/10 p-5 sm:p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
              </div>

              <div className="text-left">
                <p className="text-xs uppercase text-amber-500 font-semibold mb-1">
                  Quy tắc an toàn
                </p>

                <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1">
                  Chỉ giao dịch tối đa {safePercent}%
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* STATS */}
        {insuranceFund && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">

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

            <div className="p-5 rounded-2xl bg-card/60 border border-amber-400/30">
              <p className="text-sm text-muted-foreground mb-1">
                Quy tắc an toàn
              </p>
              <p className="text-lg md:text-xl font-bold text-amber-600">
                GD {insuranceFund.safe_trade_percentage}% tiền cọc
              </p>
            </div>

          </div>
        )}

      </div>
    </section>
  );
};

export default HeroSection;
