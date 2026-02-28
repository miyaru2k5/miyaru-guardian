import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import GDVCard from "./GDVCard";

interface Trader {
  id: string;
  name: string;
  service: string | null;
  code: string;
  insurance_fund: number;
  status: string;
  description: string | null;
  facebook: string | null;
  zalo: string | null;
  website: string | null;
}

interface Category {
  id: string;
  name: string;
}

const GDVSection = () => {
  const [traders, setTraders] = useState<Trader[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [traderCats, setTraderCats] = useState<Record<string, string[]>>({});
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCat, setFilterCat] = useState("all");
  const [filterInsurance] = useState(0);

  useEffect(() => {
    const fetchAll = async () => {
      const [tRes, cRes, tcRes] = await Promise.all([
        supabase.from("traders").select("*").order("created_at", { ascending: false }),
        supabase.from("categories").select("*"),
        supabase.from("trader_categories").select("*"),
      ]);
      setTraders((tRes.data as any[]) || []);
      setCategories((cRes.data as any[]) || []);
      const map: Record<string, string[]> = {};
      ((tcRes.data as any[]) || []).forEach((tc: any) => {
        if (!map[tc.trader_id]) map[tc.trader_id] = [];
        map[tc.trader_id].push(tc.category_id);
      });
      setTraderCats(map);
    };
    fetchAll();
  }, []);

  const filtered = useMemo(() => {
    return traders.filter(t => {
      const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.code.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "all" || t.status === filterStatus;
      const matchCat = filterCat === "all" || (traderCats[t.id] || []).includes(filterCat);
      const matchInsurance = t.insurance_fund >= filterInsurance;
      return matchSearch && matchStatus && matchCat && matchInsurance;
    });
  }, [traders, search, filterStatus, filterCat, filterInsurance, traderCats]);

  return (
    <section id="gdv" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Danh sách <span className="text-gradient">Giao dịch viên</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Các giao dịch viên đã được xác thực và có quỹ bảo hiểm
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kiếm GDV..." className="pl-10" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["all", "LIVE", "OFFLINE"].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${filterStatus === s ? "bg-primary/20 text-primary border-primary/40" : "border-border text-muted-foreground hover:text-foreground"}`}>
                {s === "all" ? "Tất cả" : s}
              </button>
            ))}
            {categories.length > 0 && (
              <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
                className="px-3 py-2 rounded-xl text-sm border border-border bg-background text-foreground">
                <option value="all">Danh mục</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((t, i) => (
            <div key={t.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <GDVCard
                name={t.name}
                service={t.service || t.code}
                code={t.code}
                insurance={`${Number(t.insurance_fund).toLocaleString("vi-VN")}đ`}
                isLive={t.status === "LIVE"}
                description={t.description || undefined}
                facebook={t.facebook}
                zalo={t.zalo}
                website={t.website}
              />
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              Không tìm thấy giao dịch viên nào
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default GDVSection;
