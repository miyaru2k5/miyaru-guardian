"use client";

import { Clock, Crown, Percent, Lock } from "lucide-react";
import { useThemeCustomizer } from "@/contexts/ThemeCustomizerContext";

const advantages = [
  {
    icon: Clock,
    title: "GDTG 24/7",
    description: "Hỗ trợ giao dịch trung gian mọi lúc, mọi nơi",
  },
  {
    icon: Crown,
    title: "Tặng VIP GDTG",
    description: "Ưu đãi đặc biệt cho khách hàng thân thiết",
  },
  {
    icon: Percent,
    title: "Phí thấp",
    description: "Mức phí cạnh tranh nhất thị trường",
  },
  {
    icon: Lock,
    title: "An toàn tuyệt đối",
    description: "Bảo mật thông tin và tiền giao dịch 100%",
  },
];

const AdvantagesSection = () => {
  const { systemSettings } = useThemeCustomizer();
  const siteName = systemSettings.site_name || "Admin";

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">

        {/* Title */}
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tại sao chọn <span className="text-gradient">{siteName}?</span>
          </h2>

          <p className="text-muted-foreground max-w-xl mx-auto">
            Những ưu điểm vượt trội khi sử dụng dịch vụ của chúng tôi
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          {advantages.map((item, index) => (
            <div
              key={index}
              className="relative rounded-2xl border border-border/60 bg-card/70 backdrop-blur-sm
              p-6 text-center transition-all duration-300
              hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10
              hover:-translate-y-1 group animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >

              {/* Icon */}
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4
                bg-gradient-to-br from-primary/20 to-primary/5
                group-hover:from-primary/30 group-hover:to-primary/10
                transition-all duration-300"
              >
                <item.icon className="w-8 h-8 text-primary" />
              </div>

              {/* Title */}
              <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                {item.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>

            </div>
          ))}

        </div>
      </div>
    </section>
  );
};

export default AdvantagesSection;