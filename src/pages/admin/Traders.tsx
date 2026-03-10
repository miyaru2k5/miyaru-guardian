import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2, Power, Loader2 } from "lucide-react";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import SearchBar from "@/components/SearchBar";
import FilterDropdown, { type FilterOption } from "@/components/FilterDropdown";
import { Textarea } from "@/components/ui/textarea";
const traderSchema = z.object({
  name: z.string().min(1, "Tên GDV là bắt buộc").max(100),
  code: z.string().min(1, "Mã GDV là bắt buộc").max(20),
  avatar_url: z.string().max(500).url({ message: "URL không hợp lệ" }).optional().or(z.literal("")),
  service: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  insurance_fund: z.coerce.number().min(0, "Quỹ bảo hiểm >= 0"),
  success_rate: z.coerce.number().min(0, "% >= 0").max(100, "% <= 100"),
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
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isFetchingUid, setIsFetchingUid] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<TraderForm>({
    resolver: zodResolver(traderSchema),
    defaultValues: { insurance_fund: 0, success_rate: 100 },
  });

  const facebookValue = watch("facebook");
  const avatarUrl = watch("avatar_url");

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

  const fetchFacebookUid = async () => {
    const url = facebookValue?.trim();
    if (!url || !url.includes("facebook.com")) {
      toast({ title: "Cảnh báo", description: "Vui lòng nhập link Facebook hợp lệ", variant: "default" });
      return;
    }

    setIsFetchingUid(true);
    try {
      const response = await fetch("https://likenhanh.pro/api/get_uid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();

      if (data.status === "success" && data.uid) {
        setValue("facebook", data.uid, { shouldValidate: true });
        toast({ title: "Thành công", description: `Đã lấy UID: ${data.uid}` });
      } else {
        toast({ title: "Lỗi", description: data.msg || "Không lấy được UID", variant: "destructive" });
      }
    } catch {
      toast({ title: "Lỗi", description: "Không kết nối được API", variant: "destructive" });
    } finally {
      setIsFetchingUid(false);
    }
  };

  const onSubmit = async (data: TraderForm) => {
    const payload = {
      name: data.name,
      code: data.code,
      avatar_url: data.avatar_url || null,
      service: data.service || "",
      description: data.description || "",
      insurance_fund: data.insurance_fund,
      success_rate: data.success_rate,
      status: editTrader?.status || "LIVE",
      facebook: data.facebook || null,
      zalo: data.zalo || null,
      website: data.website || null,
    };

    let traderId = editTrader?.id;
    if (editTrader) {
      const { error } = await supabase.from("traders").update(payload).eq("id", editTrader.id);
      if (error) return toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    } else {
      const { data: inserted, error } = await supabase.from("traders").insert([payload]).select("id").single();
      if (error) return toast({ title: "Lỗi", description: error.message, variant: "destructive" });
      traderId = inserted.id;
    }

    await supabase.from("trader_categories").delete().eq("trader_id", traderId);
    if (selectedCats.length > 0) {
      await supabase.from("trader_categories").insert(
        selectedCats.map(catId => ({ trader_id: traderId, category_id: catId }))
      );
    }

    toast({ title: editTrader ? "Đã cập nhật GDV" : "Đã thêm GDV mới" });
    setDialogOpen(false);
    setEditTrader(null);
    setSelectedCats([]);
    reset({ insurance_fund: 0, success_rate: 100 });
    fetchAll();
  };

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

  const openEdit = (t: any) => {
    setEditTrader(t);
    setSelectedCats(traderCats[t.id] || []);
    reset({
      name: t.name,
      code: t.code,
      avatar_url: t.avatar_url || "",
      service: t.service || "",
      description: t.description || "",
      insurance_fund: t.insurance_fund,
      success_rate: Number(t.success_rate),
      facebook: t.facebook || "",
      zalo: t.zalo || "",
      website: t.website || "",
    });
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditTrader(null);
    setSelectedCats([]);
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

  const handleSearchChange = useCallback((value: string) => setSearch(value), []);
  const handleFilterChange = useCallback((value: string) => setFilterCat(value), []);

  const filterOptions: FilterOption[] = useMemo(
    () => [{ value: "all", label: "Tất cả danh mục" }, ...categories.map(c => ({ value: c.id, label: c.name }))],
    [categories]
  );

  const filtered = useMemo(
    () => traders.filter(t => {
      const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.code.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCat === "all" || (traderCats[t.id] || []).includes(filterCat);
      return matchSearch && matchCat;
    }),
    [traders, search, filterCat, traderCats]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Giao dịch viên</h1>
          <p className="text-muted-foreground text-sm">Quản lý danh sách GDV</p>
        </div>
        <Button onClick={openNew} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
          <Plus size={16} /> Thêm GDV
        </Button>
      </div>

      <div className="mb-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          <div className="flex-1 w-full">
            <SearchBar onSearchChange={handleSearchChange} placeholder="Tìm kiếm giao dịch viên..." />
          </div>
          {filterOptions.length > 1 && (
            <div className="w-full md:w-auto shrink-0">
              <FilterDropdown options={filterOptions} value={filterCat} onChange={handleFilterChange} />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(t => {
          const catNames = getCatNames(t.id);
          return (
            <div key={t.id} className="glow-border rounded-2xl p-6 bg-card shadow-md hover:shadow-xl transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  {t.avatar_url ? (
                    <img src={t.avatar_url} alt={t.name} className="w-14 h-14 rounded-full object-cover border-2 border-primary/30" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/30">
                      <span className="text-xl font-bold text-primary">{t.name.charAt(0)}</span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">{t.name}</h3>
                    <p className="text-sm text-muted-foreground">{t.service || t.code}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${t.status === "LIVE" ? "bg-green-600/20 text-green-500" : "bg-red-600/20 text-red-500"}`}>
                    {t.status}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {Number(t.success_rate)}% thành công
                  </span>
                </div>
              </div>

              {catNames.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {catNames.map(name => (
                    <span key={name} className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/30">
                      {name}
                    </span>
                  ))}
                </div>
              )}

              <div className="space-y-3 mb-5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mã GDV</span>
                  <span className="font-medium">{t.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quỹ BH</span>
                  <span className="font-semibold text-primary">
                    {Number(t.insurance_fund).toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button size="sm" variant="outline" onClick={() => toggleStatus(t)} className="flex-1">
                  <Power size={14} className="mr-1" />
                  {t.status === "LIVE" ? "Tắt" : "Bật"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => openEdit(t)}><Edit size={14} /></Button>
                <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(t.id)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dialog form - rộng hơn, có preview avatar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{editTrader ? "Sửa GDV" : "Thêm GDV mới"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="max-h-[75vh] overflow-y-auto pr-2">
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Tên GDV</label>
                  <Input {...register("name")} placeholder="Nhập Tên GDV" className="focus:ring-primary" />
                  {errors.name && <p className="text-sm text-destructive mt-1.5">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Mã GDV</label>
                  <Input {...register("code")} placeholder="Nhập Mã GDV" className="focus:ring-primary" />
                  {errors.code && <p className="text-sm text-destructive mt-1.5">{errors.code.message}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Avatar URL
                  </label>

                  <div className="relative">
                    <Input
                      {...register("avatar_url")}
                      placeholder="Nhập Avatar URL"
                      className="focus:ring-primary pr-10"
                    />

                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setValue("avatar_url", "")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-destructive"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {avatarUrl && (
                    <div className="mt-3">
                      <img
                        src={avatarUrl}
                        alt="Avatar preview"
                        className="w-32 h-32 rounded-full object-cover border-2 border-primary/30 mx-auto shadow-md"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://via.placeholder.com/128?text=Error";
                        }}
                      />
                    </div>
                  )}

                  {errors.avatar_url && (
                    <p className="text-sm text-destructive mt-1.5">
                      {errors.avatar_url.message}
                    </p>
                  )}
                </div>

                {categories.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Danh mục</label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => toggleCat(c.id)}
                          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${selectedCats.includes(c.id)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                            }`}
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Dịch vụ</label>
                  <Input {...register("service")} placeholder="Nhập tên dịch vụ" className="focus:ring-primary" />
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Quỹ bảo hiểm (VNĐ)</label>
                    <Input {...register("insurance_fund")} type="number" placeholder="0" className="focus:ring-primary" />
                    {errors.insurance_fund && <p className="text-sm text-destructive mt-1.5">{errors.insurance_fund.message}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Tỷ lệ thành công (%)</label>
                    <Input {...register("success_rate")} type="number" placeholder="100" className="focus:ring-primary" />
                    {errors.success_rate && <p className="text-sm text-destructive mt-1.5">{errors.success_rate.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Mô tả
                  </label>

                  <Textarea
                    {...register("description")}
                    placeholder="Nhập mô tả ngắn gọn"
                    className="focus:ring-primary min-h-[100px]"
                  />
                </div>

                <div className="border-t border-border pt-6 space-y-5">
                  <p className="text-base font-semibold text-foreground">Liên kết</p>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Facebook UID</label>
                    <div className="flex items-center gap-3">
                      <Input
                        {...register("facebook")}
                        placeholder="Nhập link FB hoặc UID"
                        className="flex-1 focus:ring-primary"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={fetchFacebookUid}
                        disabled={isFetchingUid || !facebookValue?.trim()}
                      >
                        {isFetchingUid ? <Loader2 className="h-4 w-4 animate-spin" /> : "Get UID"}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">Nhập link profile/page → nhấn Get để lấy UID</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Zalo (SĐT)</label>
                    <Input {...register("zalo")} placeholder="Nhập Zalo / SĐT" className="focus:ring-primary" />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Website</label>
                    <Input {...register("website")} placeholder="Nhập URL website" className="focus:ring-primary" />
                  </div>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg py-6 text-base font-medium">
              {editTrader ? "Cập nhật GDV" : "Thêm GDV mới"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteId}
        title="Xác nhận xóa GDV"
        description="Bạn có chắc chắn muốn xóa giao dịch viên này? Hành động không thể hoàn tác."
        onClose={() => setDeleteId(null)}
        onConfirm={deleteTrader}
      />
    </div>
  );
};

export default Traders;