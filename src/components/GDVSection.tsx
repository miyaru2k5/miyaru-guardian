import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import GDVCard from "./GDVCard";

interface Trader {
  id: string;
  name: string;
  service: string | null;
  code: string;
  insurance_fund: number;
  status: string;
  avatar_url: string | null;
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
  const [filterCat, setFilterCat] = useState("all");

  useEffect(() => {
    const fetchAll = async () => {
      const [tRes, cRes, tcRes] = await Promise.all([
        supabase.from("traders").select("*").eq("status", "LIVE").order("created_at", { ascending: false }),
        supabase.from("categories").select("*").order("name"),
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

  const getCatNames = (traderId: string) => {
    const catIds = traderCats[traderId] || [];
    return categories.filter(c => catIds.includes(c.id)).map(c => c.name);
  };

  const filtered = useMemo(() => {
    return traders.filter(t => {
      const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.code.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCat === "all" || (traderCats[t.id] || []).includes(filterCat);
      return matchSearch && matchCat;
    });
  }, [traders, search, filterCat, traderCats]);

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

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kiếm GDV..." className="pl-10 rounded-full" />
          </div>
          {categories.length > 0 && (
            <div className="relative">
              <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-full text-sm border border-border bg-background text-foreground appearance-none cursor-pointer min-w-[160px]">
                <option value="all">Tất cả danh mục</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((t, i) => (
            <div key={t.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <GDVCard
                name={t.name}
                service={t.service || t.code}
                code={t.code}
                insurance={`${Number(t.insurance_fund).toLocaleString("vi-VN")}₫`}
                isLive={true}
                avatarUrl={t.avatar_url}
                description={t.description || undefined}
                facebook={t.facebook}
                zalo={t.zalo}
                website={t.website}
                categories={getCatNames(t.id)}
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
