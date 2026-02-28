import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, Power, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const traderSchema = z.object({
  name: z.string().min(1, "Bắt buộc").max(100),
  code: z.string().min(1, "Bắt buộc").max(20),
  avatar_url: z.string().max(500).optional(),
  service: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  insurance_fund: z.coerce.number().min(0),
  success_rate: z.coerce.number().min(0).max(100),
  facebook: z.string().max(255).optional(),
  zalo: z.string().max(50).optional(),
  website: z.string().max(255).optional(),
});

type TraderForm = z.infer<typeof traderSchema>;

interface Category {
  id: string;
  name: string;
}

const Traders = () => {
  const [traders, setTraders] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [traderCats, setTraderCats] = useState<Record<string, string[]>>({});
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [editTrader, setEditTrader] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TraderForm>({
    resolver: zodResolver(traderSchema),
    defaultValues: { insurance_fund: 0, success_rate: 100 },
  });

  const fetchAll = async () => {
    const [tRes, cRes, tcRes] = await Promise.all([
      supabase.from("traders").select("*").order("created_at", { ascending: false }),
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

  const onSubmit = async (data: TraderForm) => {
    const payload = {
      name: data.name, code: data.code, avatar_url: data.avatar_url || null,
      service: data.service || "", description: data.description || "",
      insurance_fund: data.insurance_fund, success_rate: data.success_rate,
      facebook: data.facebook || null, zalo: data.zalo || null, website: data.website || null,
    };
    let traderId = editTrader?.id;
    if (editTrader) {
      const { error } = await supabase.from("traders").update(payload).eq("id", editTrader.id);
      if (error) { toast({ title: "Lỗi", description: error.message, variant: "destructive" }); return; }
    } else {
      const { data: inserted, error } = await supabase.from("traders").insert([payload]).select("id").single();
      if (error) { toast({ title: "Lỗi", description: error.message, variant: "destructive" }); return; }
      traderId = inserted.id;
    }

    await supabase.from("trader_categories").delete().eq("trader_id", traderId);
    if (selectedCats.length > 0) {
      await supabase.from("trader_categories").insert(
        selectedCats.map(catId => ({ trader_id: traderId, category_id: catId }))
      );
    }

    toast({ title: editTrader ? "Đã cập nhật GDV" : "Đã thêm GDV mới" });
    setDialogOpen(false); setEditTrader(null); setSelectedCats([]);
    reset({ insurance_fund: 0, success_rate: 100 });
    fetchAll();
  };

  const toggleStatus = async (trader: any) => {
    const newStatus = trader.status === "LIVE" ? "OFFLINE" : "LIVE";
    await supabase.from("traders").update({ status: newStatus }).eq("id", trader.id);
    fetchAll();
  };

  const deleteTrader = async (id: string) => {
    if (!confirm("Xác nhận xóa GDV này?")) return;
    await supabase.from("trader_categories").delete().eq("trader_id", id);
    await supabase.from("traders").delete().eq("id", id);
    toast({ title: "Đã xóa GDV" });
    fetchAll();
  };

  const openEdit = (t: any) => {
    setEditTrader(t);
    setSelectedCats(traderCats[t.id] || []);
    reset({
      name: t.name, code: t.code, avatar_url: t.avatar_url || "",
      service: t.service || "", description: t.description || "",
      insurance_fund: t.insurance_fund, success_rate: Number(t.success_rate),
      facebook: t.facebook || "", zalo: t.zalo || "", website: t.website || "",
    });
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditTrader(null); setSelectedCats([]);
    reset({ name: "", code: "", avatar_url: "", service: "", description: "", insurance_fund: 0, success_rate: 100, facebook: "", zalo: "", website: "" });
    setDialogOpen(true);
  };

  const toggleCat = (catId: string) => {
    setSelectedCats(prev => prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]);
  };

  const getCatNames = (traderId: string) => {
    const catIds = traderCats[traderId] || [];
    return categories.filter(c => catIds.includes(c.id)).map(c => c.name);
  };

  const filtered = traders.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.code.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "all" || (traderCats[t.id] || []).includes(filterCat);
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Giao dịch viên</h1>
          <p className="text-muted-foreground text-sm">Quản lý danh sách GDV</p>
        </div>
        <Button onClick={openNew} className="btn-glow gap-2"><Plus size={16} /> Thêm GDV</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kiếm..." className="pl-10" />
        </div>
        {categories.length > 0 && (
          <div className="relative">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl text-sm border border-border bg-background text-foreground appearance-none cursor-pointer min-w-[160px]">
              <option value="all">Tất cả danh mục</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(t => {
          const catNames = getCatNames(t.id);
          return (
            <div key={t.id} className="glow-border rounded-2xl p-5 card-hover">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {t.avatar_url ? (
                    <img src={t.avatar_url} alt={t.name} className="w-12 h-12 rounded-full object-cover border border-primary/20" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/20">
                      <span className="text-lg font-bold text-primary">{t.name.charAt(0)}</span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-foreground">{t.name}</h3>
                    <p className="text-xs text-muted-foreground">{t.service || t.code}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${t.status === "LIVE" ? "status-live" : "status-offline"}`}>{t.status}</span>
              </div>
              {catNames.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {catNames.map(name => (
                    <span key={name} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">{name}</span>
                  ))}
                </div>
              )}
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Mã GDV</span><span className="font-medium text-foreground">{t.code}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Quỹ BH</span><span className="font-semibold text-primary">{Number(t.insurance_fund).toLocaleString("vi-VN")}đ</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">% Thành công</span><span className="text-foreground">{Number(t.success_rate)}%</span></div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => toggleStatus(t)} className="flex-1 gap-1"><Power size={14} />{t.status === "LIVE" ? "Tắt" : "Bật"}</Button>
                <Button size="sm" variant="outline" onClick={() => openEdit(t)}><Edit size={14} /></Button>
                <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10" onClick={() => deleteTrader(t.id)}><Trash2 size={14} /></Button>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editTrader ? "Sửa GDV" : "Thêm GDV mới"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Tên GDV</label>
              <Input {...register("name")} placeholder="Nhập tên giao dịch viên" />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Mã GDV</label>
              <Input {...register("code")} placeholder="VD: GDV#001" />
              {errors.code && <p className="text-xs text-destructive mt-1">{errors.code.message}</p>}
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Avatar URL</label>
              <Input {...register("avatar_url")} placeholder="https://..." />
            </div>
            {categories.length > 0 && (
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Danh mục</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(c => (
                    <button key={c.id} type="button" onClick={() => toggleCat(c.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        selectedCats.includes(c.id)
                          ? "bg-primary/20 text-primary border-primary/40"
                          : "border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                      }`}>
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Dịch vụ</label>
              <Input {...register("service")} placeholder="Nhập tên dịch vụ" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Quỹ bảo hiểm</label>
                <Input {...register("insurance_fund")} type="number" placeholder="0" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">% Thành công</label>
                <Input {...register("success_rate")} type="number" placeholder="100" />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Mô tả</label>
              <Input {...register("description")} placeholder="Nhập mô tả" />
            </div>
            <div className="border-t border-border pt-4 space-y-4">
              <p className="text-sm font-medium text-muted-foreground">Liên kết</p>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Facebook UID</label>
                <Input {...register("facebook")} placeholder="VD: 100012345678" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Zalo (SĐT)</label>
                <Input {...register("zalo")} placeholder="VD: 0357175172" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Website</label>
                <Input {...register("website")} placeholder="VD: miyaru.online" />
              </div>
            </div>
            <Button type="submit" className="w-full btn-glow">{editTrader ? "Cập nhật" : "Thêm mới"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Traders;
