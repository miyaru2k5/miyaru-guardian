import { Wallet, ShieldCheck, CheckCircle2 } from "lucide-react";

const steps = [
  {
    icon: Wallet,
    title: "Người mua chuyển tiền",
    description: "Người mua chuyển tiền vào tài khoản Admin",
  },
  {
    icon: ShieldCheck,
    title: "Admin giữ tiền & xác nhận",
    description: "Admin xác nhận giao dịch và bảo vệ tiền",
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

      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />

      <div className="container mx-auto relative z-10">

        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Quy trình <span className="text-gradient">Giao dịch</span>
          </h2>

          <p className="text-muted-foreground max-w-xl mx-auto">
            3 bước đơn giản để hoàn tất giao dịch an toàn
          </p>
        </div>

        {/* Steps */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-4">

          {steps.map((step, index) => (
            <div key={index} className="flex flex-col md:flex-row items-center gap-4">

              {/* Card */}
              <div
                className="relative rounded-2xl border border-border/60
                bg-card/70 backdrop-blur-sm
                p-6 w-full max-w-sm text-center
                transition-all duration-300
                hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1
                animate-fade-in-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >

                {/* Step Number */}
                <div
                  className="absolute -top-4 left-1/2 -translate-x-1/2
                  w-9 h-9 rounded-full
                  bg-primary text-primary-foreground
                  flex items-center justify-center
                  text-sm font-semibold shadow-md"
                >
                  {index + 1}
                </div>

                {/* Icon */}
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 mt-2
                  bg-gradient-to-br from-primary/20 to-primary/5
                  group-hover:from-primary/30 group-hover:to-primary/10
                  transition-all"
                >
                  <step.icon className="w-8 h-8 text-primary" />
                </div>

                {/* Title */}
                <h3 className="font-semibold text-foreground mb-2">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Connector */}
              {index < steps.length - 1 && (
                <div
                  className="hidden md:block w-20 h-[2px]
                  bg-gradient-to-r from-primary/30 via-primary/60 to-primary/30
                  rounded-full"
                />
              )}

            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;