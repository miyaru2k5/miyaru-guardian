import { useEffect, useState } from "react";
import { TrendingUp, CheckCircle, Wallet, DollarSign, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const useCountUp = (target: number, duration = 1500) => {
  const [count, setCount] = useState(0);
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
  return count;
};

const CHART_COLORS = ["hsl(330, 100%, 55%)", "hsl(160, 60%, 45%)", "hsl(220, 80%, 55%)", "hsl(40, 90%, 55%)"];

const Dashboard = () => {
  const [stats, setStats] = useState({ total: 0, success: 0, holding: 0, fees: 0, liveGdv: 0, totalGdv: 0, totalInsurance: 0 });
  const [statusData, setStatusData] = useState<{ name: string; value: number }[]>([]);
  const [monthlyData, setMonthlyData] = useState<{ name: string; count: number }[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const [txRes, traderRes, insuranceRes] = await Promise.all([
        supabase.from("transactions").select("amount, fee, status, created_at"),
        supabase.from("traders").select("status, insurance_fund"),
        supabase.from("insurance_fund").select("total_fund").limit(1).maybeSingle(),
      ]);

      const txs = txRes.data || [];
      const traders = traderRes.data || [];
      const completed = txs.filter(t => t.status === "completed");
      const holding = txs.filter(t => t.status === "confirmed").reduce((s, t) => s + (t.amount || 0), 0);
      const fees = completed.reduce((s, t) => s + (t.fee || 0), 0);
      const live = traders.filter(t => t.status === "LIVE").length;
      const offline = traders.filter(t => t.status === "OFFLINE").length;
      const totalInsurance = insuranceRes.data?.total_fund || 0;

      setStats({
        total: txs.length,
        success: txs.length > 0 ? Math.round((completed.length / txs.length) * 100) : 0,
        holding, fees,
        liveGdv: live,
        totalGdv: traders.length,
        totalInsurance,
      });

      setStatusData([
        { name: "LIVE", value: live },
        { name: "OFFLINE", value: offline },
      ]);

      // Monthly data from transactions
      const monthMap: Record<string, number> = {};
      txs.forEach(tx => {
        const d = new Date(tx.created_at);
        const key = `${d.getMonth() + 1}/${d.getFullYear()}`;
        monthMap[key] = (monthMap[key] || 0) + 1;
      });
      setMonthlyData(Object.entries(monthMap).map(([name, count]) => ({ name, count })).slice(-6));
    };
    fetchStats();
  }, []);

  const cards = [
    { icon: TrendingUp, label: "Tổng giao dịch", value: stats.total, suffix: "", color: "text-primary" },
    { icon: CheckCircle, label: "Tỷ lệ thành công", value: stats.success, suffix: "%", color: "text-emerald-400" },
    { icon: Wallet, label: "Tiền đang giữ", value: stats.holding, suffix: "đ", color: "text-blue-400", format: true },
    { icon: DollarSign, label: "Tổng phí", value: stats.fees, suffix: "đ", color: "text-amber-400", format: true },
    { icon: Users, label: "GDV LIVE", value: stats.liveGdv, suffix: `/${stats.totalGdv}`, color: "text-emerald-400" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Tổng quan hệ thống Miyaru GDTG</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map((card, i) => {
          const count = useCountUp(card.value);
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Transactions by month */}
        <div className="glow-border rounded-2xl p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Giao dịch theo tháng</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <XAxis dataKey="name" stroke="hsl(240, 5%, 65%)" fontSize={12} />
                <YAxis stroke="hsl(240, 5%, 65%)" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(240, 10%, 8%)", border: "1px solid hsl(240, 10%, 18%)", borderRadius: "0.75rem", color: "#fafafa" }} />
                <Bar dataKey="count" fill="hsl(330, 100%, 55%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart - GDV Status */}
        <div className="glow-border rounded-2xl p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Trạng thái GDV</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(240, 10%, 8%)", border: "1px solid hsl(240, 10%, 18%)", borderRadius: "0.75rem", color: "#fafafa" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
