import { Shield, UserCheck, Headphones, Zap, AlertTriangle } from "lucide-react";
import { useThemeCustomizer } from "@/contexts/ThemeCustomizerContext";

const HeroSection = () => {
  const { systemSettings } = useThemeCustomizer();
  const siteName = systemSettings.site_name || "Admin";

  const features = [
    { icon: Shield, text: "Được bảo vệ bởi quỹ bảo hiểm" },
    { icon: UserCheck, text: "Xác thực danh tính rõ ràng" },
    { icon: Headphones, text: "Hỗ trợ nhanh chóng" },
    { icon: Zap, text: "Xử lý giao dịch trong vài phút" },
  ];

  return (
    <section className="pt-32 pb-20 px-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="container mx-auto text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-8 animate-fade-in-up">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-primary text-sm font-medium">GIAO DỊCH VIÊN</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          Giao dịch viên <span className="text-gradient">Uy tín & Tận tâm</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
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
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm text-foreground text-left">{feature.text}</span>
            </div>
          ))}
        </div>

        {/* Warning Box */}
        <div 
          className="inline-flex items-center gap-3 px-6 py-4 rounded-xl bg-amber-500/10 border border-amber-500/30 animate-fade-in-up"
          style={{ animationDelay: "0.7s" }}
        >
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <span className="text-amber-200 text-sm md:text-base">
            Chỉ nên giao dịch dưới 80% số tiền bảo hiểm của GDV
          </span>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
