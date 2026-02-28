import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Copy } from "lucide-react";

interface BankAccount {
  id: string;
  bank_name: string;
  account_number: string;
  account_holder: string;
  is_visible: boolean;
  logo_url: string | null;
  qr_image_url: string | null;
}

const BankAccountsSection = () => {
  const [banks, setBanks] = useState<BankAccount[]>([]);

  useEffect(() => {
    const fetchBanks = async () => {
      const { data } = await supabase
        .from("bank_accounts")
        .select("*")
        .eq("is_visible", true)
        .order("created_at", { ascending: true });
      setBanks((data as BankAccount[]) || []);
    };

    fetchBanks();
  }, []);

  const copyAccount = (num: string) => {
    navigator.clipboard.writeText(num);
  };

  if (banks.length === 0) return null;

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="mb-8 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Tài khoản ngân hàng bảo chứng
          </h3>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            Sử dụng các tài khoản bên dưới để chuyển khoản khi giao dịch trung gian.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {banks.map(bank => (
            <div
              key={bank.id}
              className="rounded-2xl bg-card/80 border border-border p-5 flex items-center justify-between gap-4 card-hover"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden border border-border">
                  {bank.logo_url ? (
                    <img
                      src={bank.logo_url}
                      alt={bank.bank_name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-primary">
                      {bank.bank_name.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">
                    {bank.bank_name}
                  </p>
                  <p className="text-lg font-semibold tracking-wide text-foreground">
                    {bank.account_number}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {bank.account_holder}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                {bank.qr_image_url && (
                  <a
                    href={bank.qr_image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-16 h-16 rounded-xl border border-border overflow-hidden bg-background/60 hover:border-primary/40 transition-colors"
                  >
                    <img
                      src={bank.qr_image_url}
                      alt={`QR ${bank.bank_name}`}
                      className="w-full h-full object-cover"
                    />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => copyAccount(bank.account_number)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  <Copy size={14} />
                  Sao chép STK
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BankAccountsSection;

