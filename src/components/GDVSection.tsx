import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search as SearchIcon } from "lucide-react";
import GDVCard from "./GDVCard";
import SearchBar from "./SearchBar";
import FilterDropdown, { type FilterOption } from "./FilterDropdown";

interface Trader {
  id: string;
  name: string;
  service: string | null;
  code: string;
  insurance_fund: number;
  status: string;
   // success_rate is used for display under LIVE badge
  // eslint-disable-next-line @typescript-eslint/naming-convention
  success_rate: number;
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
  const [insuranceFund, setInsuranceFund] = useState<{
    total_fund: number;
    currently_insured: number;
    max_percentage: number;
  } | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      const [tRes, cRes, tcRes, iRes] = await Promise.all([
        supabase.from("traders").select("*").eq("status", "LIVE").order("created_at", { ascending: true }),
        supabase.from("categories").select("*").order("name"),
        supabase.from("trader_categories").select("*"),
        supabase.from("insurance_fund").select("*").limit(1).maybeSingle(),
      ]);
      setTraders((tRes.data as any[]) || []);
      setCategories((cRes.data as any[]) || []);
      const map: Record<string, string[]> = {};
      ((tcRes.data as any[]) || []).forEach((tc: any) => {
        if (!map[tc.trader_id]) map[tc.trader_id] = [];
        map[tc.trader_id].push(tc.category_id);
      });
      setTraderCats(map);
      if (iRes.data) {
        setInsuranceFund(iRes.data as any);
      }
    };
    fetchAll();
  }, []);

  const getCatNames = (traderId: string) => {
    const catIds = traderCats[traderId] || [];
    return categories.filter(c => catIds.includes(c.id)).map(c => c.name);
  };

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const handleFilterChange = useCallback((value: string) => {
    setFilterCat(value);
  }, []);

  const filterOptions: FilterOption[] = useMemo(
    () => [
      { value: "all", label: "Tất cả danh mục" },
      ...categories.map(c => ({ value: c.id, label: c.name })),
    ],
    [categories],
  );

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
          {insuranceFund && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
              <div className="p-4 rounded-2xl bg-card/60 border border-border">
                <p className="text-xs text-muted-foreground mb-1">Tổng quỹ bảo hiểm</p>
                <p className="text-sm font-semibold text-primary">
                  {Number(insuranceFund.total_fund || 0).toLocaleString("vi-VN")}đ
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-card/60 border border-border">
                <p className="text-xs text-muted-foreground mb-1">Đang bảo chứng</p>
                <p className="text-sm font-semibold text-foreground">
                  {Number(insuranceFund.currently_insured || 0).toLocaleString("vi-VN")}đ
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-card/60 border border-border">
                <p className="text-xs text-muted-foreground mb-1">Tỷ lệ tối đa / hiện tại</p>
                <p className="text-sm font-semibold text-foreground">
                  Tối đa {Number(insuranceFund.max_percentage || 0).toFixed(1)}% -{" "}
                  {(
                    (Number(insuranceFund.currently_insured || 0) /
                      Math.max(Number(insuranceFund.total_fund || 1), 1)) *
                    100
                  ).toFixed(1)}
                  %
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            <div className="flex-1 w-full">
              <SearchBar
                onSearchChange={handleSearchChange}
                placeholder="Tìm kiếm giao dịch viên..."
              />
            </div>
            {filterOptions.length > 1 && (
              <div className="w-full md:w-auto shrink-0">
                <FilterDropdown
                  options={filterOptions}
                  value={filterCat}
                  onChange={handleFilterChange}
                />
              </div>
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
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <SearchIcon size={22} className="text-primary" />
              </div>
              <p className="mb-1 text-base font-medium text-foreground">
                Không tìm thấy giao dịch viên phù hợp
              </p>
              <p className="max-w-md text-sm text-muted-foreground">
                Thử thay đổi từ khóa tìm kiếm hoặc bấm{" "}
                <span className="font-semibold">"Xóa bộ lọc"</span> để xem tất cả giao dịch viên.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default GDVSection;
