"use client";

import { useEffect, useState } from "react";
import {
  Users,
  UserCircle,
  LayoutGrid,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

const useCountUp = (target: number, duration = 1500) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
};

const CHART_COLORS = [
  "hsl(25, 95%, 53%)",
  "hsl(160, 60%, 45%)",
  "hsl(220, 80%, 55%)",
  "hsl(40, 90%, 55%)",
];

const StatCard = ({
  icon: Icon,
  label,
  value,
  suffix = "",
  color = "text-primary",
  format = false,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  suffix?: string;
  color?: string;
  format?: boolean;
}) => {
  const count = useCountUp(value);
  return (
    <div className="glow-border rounded-lg p-5">
      <div className="mb-3 flex items-center gap-2">
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <p className={`text-2xl font-bold ${color}`}>
        {format ? count.toLocaleString("vi-VN") : count}
        {suffix}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    liveGdv: 0,
    totalGdv: 0,
    totalUsers: 0,
    totalCategories: 0,
  });
  const [statusData, setStatusData] = useState<{ name: string; value: number }[]>(
    []
  );

  useEffect(() => {
    const fetchStats = async () => {
      const [traderRes, profilesRes, categoriesRes] = await Promise.all([
        supabase.from("traders").select("status"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("categories").select("id", { count: "exact", head: true }),
      ]);

      const traders = traderRes.data || [];
      const live = traders.filter((t) => t.status === "LIVE").length;
      const offline = traders.filter((t) => t.status === "OFFLINE").length;

      setStats({
        liveGdv: live,
        totalGdv: traders.length,
        totalUsers: profilesRes.count ?? 0,
        totalCategories: categoriesRes.count ?? 0,
      });

      setStatusData([
        { name: "LIVE", value: live },
        { name: "OFFLINE", value: offline },
      ]);
    };
    void fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <div className="ds-page-header">
        <h1 className="ds-page-title">Dashboard</h1>
        <p className="ds-page-desc">Tổng quan hệ thống</p>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Thống kê chính
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            icon={UserCircle}
            label="Tổng user"
            value={stats.totalUsers}
            color="text-primary"
          />
          <StatCard
            icon={Users}
            label="GDV LIVE"
            value={stats.liveGdv}
            suffix={`/${stats.totalGdv}`}
            color="text-emerald-400"
          />
          <StatCard
            icon={LayoutGrid}
            label="Danh mục"
            value={stats.totalCategories}
            color="text-violet-400"
          />
        </div>
      </div>

      <div className="glow-border rounded-lg p-6">
        <h3 className="mb-4 text-lg font-bold text-foreground">
          Trạng thái GDV
        </h3>
        <div className="flex h-64 items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {statusData.map((_, i) => (
                  <Cell
                    key={`cell-${i}`}
                    fill={CHART_COLORS[i % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          {statusData.map((s, i) => (
            <div key={s.name} className="flex items-center gap-2 text-sm">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
              />
              <span className="text-muted-foreground">
                {s.name}: {s.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
