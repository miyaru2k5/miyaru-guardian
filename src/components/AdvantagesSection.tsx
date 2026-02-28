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
  const siteName = systemSettings.site_name || "Miyaru";

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tại sao chọn <span className="text-gradient">{siteName}?</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Những ưu điểm vượt trội khi sử dụng dịch vụ của chúng tôi
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {advantages.map((item, index) => (
            <div 
              key={index}
              className="glow-border rounded-2xl p-6 text-center card-hover group animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <item.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AdvantagesSection;
