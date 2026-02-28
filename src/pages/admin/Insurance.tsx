import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ShieldCheck, AlertTriangle } from "lucide-react";

const Insurance = () => {
  const [fund, setFund] = useState<any>(null);
  const [totalFund, setTotalFund] = useState(0);
  const [insured, setInsured] = useState(0);

  const fetchFund = async () => {
    const { data } = await supabase.from("insurance_fund").select("*").limit(1).maybeSingle();
    if (data) {
      setFund(data);
      setTotalFund(data.total_fund);
      setInsured(data.currently_insured);
    }
  };

  useEffect(() => { fetchFund(); }, []);

  const percentage = fund ? (fund.currently_insured / Math.max(fund.total_fund, 1)) * 100 : 0;
  const isWarning = percentage > 80;

  const save = async () => {
    if (fund) {
      await supabase.from("insurance_fund").update({ total_fund: totalFund, currently_insured: insured }).eq("id", fund.id);
    } else {
      await supabase.from("insurance_fund").insert({ total_fund: totalFund, currently_insured: insured });
    }
    toast({ title: "Đã cập nhật quỹ bảo hiểm" });
    fetchFund();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Quỹ bảo hiểm</h1>
        <p className="text-muted-foreground text-sm">Quản lý và giám sát quỹ bảo hiểm hệ thống</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glow-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Tổng quan quỹ</h2>
              <p className="text-sm text-muted-foreground">Rule: Giao dịch ≤ 20% quỹ GDV</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-card border border-border">
                <p className="text-sm text-muted-foreground mb-1">Tổng quỹ</p>
                <p className="text-2xl font-bold text-primary">{(fund?.total_fund || 0).toLocaleString("vi-VN")}đ</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border">
                <p className="text-sm text-muted-foreground mb-1">Đang bảo chứng</p>
                <p className="text-2xl font-bold text-foreground">{(fund?.currently_insured || 0).toLocaleString("vi-VN")}đ</p>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Tỷ lệ sử dụng</span>
                <span className={`font-medium ${isWarning ? "text-destructive" : "text-foreground"}`}>{percentage.toFixed(1)}%</span>
              </div>
              <Progress value={percentage} className={`h-3 ${isWarning ? "[&>div]:bg-destructive" : ""}`} />
            </div>

            {isWarning && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/30">
                <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive">Cảnh báo: Tỷ lệ bảo chứng vượt 80% quỹ!</p>
              </div>
            )}
          </div>
        </div>

        <div className="glow-border rounded-2xl p-6 h-fit">
          <h3 className="text-lg font-bold text-foreground mb-4">Chỉnh sửa quỹ</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Tổng quỹ (VNĐ)</label>
              <Input type="number" value={totalFund} onChange={e => setTotalFund(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Đang bảo chứng (VNĐ)</label>
              <Input type="number" value={insured} onChange={e => setInsured(Number(e.target.value))} />
            </div>
            <Button onClick={save} className="btn-glow w-full">Lưu thay đổi</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Insurance;
