"use client";

import { Shield, TrendingUp, Clock } from "lucide-react";
import { useThemeCustomizer } from "@/contexts/ThemeCustomizerContext";

const GDTGSection = () => {
  const { systemSettings } = useThemeCustomizer();
  const siteName = systemSettings.site_name || "Admin";

  const stats = [
    { icon: TrendingUp, value: "10K+", label: "Giao dịch thành công", color: "text-primary" },
    { icon: Shield, value: "99,9%", label: "Tỷ lệ thành công", color: "text-primary" },
    { icon: Clock, value: "24/7", label: "Hỗ trợ liên tục", color: "text-primary" },
  ];

  return (
    <section id="gdtg" className="py-20 px-4 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-primary/10 to-primary/5 pointer-events-none" />
      
      <div className="container mx-auto relative z-10">
        {/* Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-primary text-sm font-medium">GIAO DỊCH TRUNG GIAN</span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {siteName} <span className="text-gradient">GDTG</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Dịch vụ trung gian đảm bảo giao dịch an toàn tuyệt đối giữa người mua và người bán. 
            Không lo lừa đảo, không lo mất tiền.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="text-center p-6 rounded-2xl bg-card/50 border border-border hover:border-primary/30 transition-all card-hover animate-fade-in-up"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className={`text-5xl md:text-6xl font-bold ${stat.color} mb-2`}>
                {stat.value}
              </div>
              <p className="text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GDTGSection;
