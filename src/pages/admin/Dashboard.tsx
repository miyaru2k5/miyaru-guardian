import { useEffect, useState, useRef } from "react";
import { TrendingUp, CheckCircle, Wallet, DollarSign, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const useCountUp = (target: number, duration = 1500) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return { count, ref };
};

const Dashboard = () => {
  const [stats, setStats] = useState({ total: 0, success: 0, holding: 0, fees: 0, liveGdv: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [txRes, traderRes] = await Promise.all([
        supabase.from("transactions").select("amount, fee, status"),
        supabase.from("traders").select("status"),
      ]);

      const txs = txRes.data || [];
      const traders = traderRes.data || [];
      const completed = txs.filter(t => t.status === "completed");
      const holding = txs.filter(t => t.status === "confirmed").reduce((s, t) => s + (t.amount || 0), 0);
      const fees = completed.reduce((s, t) => s + (t.fee || 0), 0);
      const live = traders.filter(t => t.status === "LIVE").length;

      setStats({
        total: txs.length,
        success: txs.length > 0 ? Math.round((completed.length / txs.length) * 100) : 0,
        holding,
        fees,
        liveGdv: live,
      });
    };
    fetchStats();
  }, []);

  const cards = [
    { icon: TrendingUp, label: "Tổng giao dịch", value: stats.total, suffix: "", color: "text-primary" },
    { icon: CheckCircle, label: "Tỷ lệ thành công", value: stats.success, suffix: "%", color: "text-emerald-400" },
    { icon: Wallet, label: "Tổng tiền đang giữ", value: stats.holding, suffix: "đ", color: "text-blue-400", format: true },
    { icon: DollarSign, label: "Tổng phí", value: stats.fees, suffix: "đ", color: "text-amber-400", format: true },
    { icon: Users, label: "GDV LIVE", value: stats.liveGdv, suffix: "", color: "text-emerald-400" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Tổng quan hệ thống Miyaru GDTG</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map((card, i) => {
          const { count } = useCountUp(card.value);
          return (
            <div key={i} className="glow-border rounded-2xl p-5 card-hover">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
              <p className={`text-2xl font-bold ${card.color}`}>
                {card.format ? count.toLocaleString("vi-VN") : count}{card.suffix}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{card.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
