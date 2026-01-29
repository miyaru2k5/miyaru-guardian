import { Copy } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const banks = [
  { name: "Techcombank", number: "1903 8888 1234 56", owner: "NGUYEN VAN MIYARU", color: "from-red-500 to-red-600" },
  { name: "VPBank", number: "1234 5678 9012 34", owner: "NGUYEN VAN MIYARU", color: "from-green-500 to-green-600" },
  { name: "MSB", number: "0012 3456 7890 12", owner: "NGUYEN VAN MIYARU", color: "from-blue-500 to-blue-600" },
  { name: "HDBank", number: "5678 9012 3456 78", owner: "NGUYEN VAN MIYARU", color: "from-orange-500 to-orange-600" },
];

const BankSection = () => {
  const copyToClipboard = (text: string, bankName: string) => {
    navigator.clipboard.writeText(text.replace(/\s/g, ''));
    toast({
      title: "Đã sao chép!",
      description: `Số tài khoản ${bankName} đã được sao chép`,
    });
  };

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tài khoản <span className="text-gradient">ngân hàng</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Chuyển tiền đến các tài khoản chính thức của Miyaru
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {banks.map((bank, index) => (
            <div 
              key={bank.name}
              className="glow-border rounded-2xl p-5 card-hover animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Bank Logo Placeholder */}
              <div className={`w-full h-12 rounded-lg bg-gradient-to-r ${bank.color} flex items-center justify-center mb-4`}>
                <span className="text-white font-bold">{bank.name}</span>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Số tài khoản</p>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-foreground">{bank.number}</span>
                    <button 
                      onClick={() => copyToClipboard(bank.number, bank.name)}
                      className="p-1 hover:bg-primary/10 rounded transition-colors"
                    >
                      <Copy className="w-4 h-4 text-primary" />
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Chủ tài khoản</p>
                  <span className="font-medium text-foreground text-sm">{bank.owner}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BankSection;
