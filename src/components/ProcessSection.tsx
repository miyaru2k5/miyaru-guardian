import { Wallet, ShieldCheck, CheckCircle2 } from "lucide-react";

const steps = [
  {
    icon: Wallet,
    title: "Người mua chuyển tiền",
    description: "Người mua chuyển tiền vào tài khoản Miyaru",
  },
  {
    icon: ShieldCheck,
    title: "Miyaru giữ tiền & xác nhận",
    description: "Miyaru xác nhận giao dịch và bảo vệ tiền",
  },
  {
    icon: CheckCircle2,
    title: "Hoàn tất giao dịch",
    description: "Giao dịch hoàn tất, tiền được chuyển cho người bán",
  },
];

const ProcessSection = () => {
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
      
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Quy trình <span className="text-gradient">giao dịch</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            3 bước đơn giản để hoàn tất giao dịch an toàn
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-4">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col md:flex-row items-center gap-4">
              {/* Step Card */}
              <div 
                className="relative glow-border rounded-2xl p-6 w-full max-w-sm text-center card-hover animate-fade-in-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {/* Step Number */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm btn-glow">
                  {index + 1}
                </div>

                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 mt-2">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>

                <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>

              {/* Connector */}
              {index < steps.length - 1 && (
                <div className="hidden md:block w-16 h-1 bg-gradient-to-r from-primary/50 to-primary rounded-full" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
