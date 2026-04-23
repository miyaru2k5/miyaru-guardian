"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Power, Copy } from "lucide-react";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import SearchBar from "@/components/SearchBar";
import FilterDropdown, { type FilterOption } from "@/components/FilterDropdown";

interface Category {
  id: string;
  name: string;
}

const TradersPage = () => {
  const router = useRouter();

  const [traders, setTraders] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [traderCats, setTraderCats] = useState<Record<string, string[]>>({});
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchAll = async () => {
    const [tRes, cRes, tcRes] = await Promise.all([
      supabase.from("traders").select("*").order("created_at", { ascending: true }),
      supabase.from("categories").select("*").order("name"),
      supabase.from("trader_categories").select("*"),
    ]);

    setTraders(tRes.data || []);
    setCategories((cRes.data as Category[]) || []);

    const map: Record<string, string[]> = {};
    ((tcRes.data as any[]) || []).forEach((tc: any) => {
      if (!map[tc.trader_id]) map[tc.trader_id] = [];
      map[tc.trader_id].push(tc.category_id);
    });
    setTraderCats(map);
  };

  useEffect(() => { fetchAll(); }, []);

  const toggleStatus = async (trader: any) => {
    const newStatus = trader.status === "LIVE" ? "OFFLINE" : "LIVE";
    await supabase.from("traders").update({ status: newStatus }).eq("id", trader.id);
    fetchAll();
  };

  const deleteTrader = async () => {
    if (!deleteId) return;
    await supabase.from("trader_categories").delete().eq("trader_id", deleteId);
    await supabase.from("traders").delete().eq("id", deleteId);
    toast({ title: "Đã xóa GDV" });
    setDeleteId(null);
    fetchAll();
  };

  const copyLink = (slug: string) => {
    const url = `${process.env.NEXT_PUBLIC_WEBSITE_URL}/${slug}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Đã copy link", description: url });
  };

  const getCatNames = (traderId: string) => {
    const catIds = traderCats[traderId] || [];
    return categories.filter(c => catIds.includes(c.id)).map(c => c.name);
  };

  const handleSearchChange = useCallback((value: string) => setSearch(value), []);
  const handleFilterChange = useCallback((value: string) => setFilterCat(value), []);

  const filterOptions: FilterOption[] = useMemo(
    () => [
      { value: "all", label: "Tất cả danh mục" },
      ...categories.map(c => ({ value: c.id, label: c.name })),
    ],
    [categories]
  );

  const filtered = useMemo(
    () =>
      traders.filter(t => {
        const matchSearch =
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.code.toLowerCase().includes(search.toLowerCase());
        const matchCat =
          filterCat === "all" || (traderCats[t.id] || []).includes(filterCat);
        return matchSearch && matchCat;
      }),
    [traders, search, filterCat, traderCats]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Giao dịch viên</h1>
          <p className="text-muted-foreground text-sm">Quản lý danh sách GDV</p>
        </div>
        <Button onClick={() => router.push("/admin/traders/add")} className="btn-glow gap-2">
          <Plus size={16} /> Thêm GDV
        </Button>
      </div>

      {/* Search + Filter */}
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

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(t => {
          const catNames = getCatNames(t.id);
          return (
            <div key={t.id} className="glow-border rounded-2xl p-5 card-hover">
              {/* Top row */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {t.avatar_url ? (
                    <img
                      src={t.avatar_url}
                      alt={t.name}
                      className="w-12 h-12 rounded-full object-cover border border-primary/20"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/20">
                      <span className="text-lg font-bold text-primary">
                        {t.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-foreground">{t.name}</h3>
                    <p className="text-xs text-muted-foreground">{t.service || t.code}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      t.status === "LIVE" ? "status-live" : "status-offline"
                    }`}
                  >
                    {t.status}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {Number(t.success_rate)}% thành công
                  </span>
                </div>
              </div>

              {/* Categories */}
              {catNames.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {catNames.map(name => (
                    <span
                      key={name}
                      className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary border border-primary/20"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mã GDV</span>
                  <span className="font-medium text-foreground">{t.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quỹ BH</span>
                  <span className="font-semibold text-primary">
                    {Number(t.insurance_fund).toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleStatus(t)}
                  className="flex-1 gap-1"
                >
                  <Power size={14} />
                  {t.status === "LIVE" ? "Tắt" : "Bật"}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(`/admin/traders/edit/${t.id}`)}
                >
                  <Edit size={14} />
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyLink(t.slug)}
                >
                  <Copy size={14} />
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => setDeleteId(t.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDeleteDialog
        open={!!deleteId}
        title="Xác nhận xóa GDV"
        description="Bạn có chắc chắn muốn xóa giao dịch viên này?"
        onClose={() => setDeleteId(null)}
        onConfirm={deleteTrader}
      />
    </div>
  );
};

export default TradersPage;