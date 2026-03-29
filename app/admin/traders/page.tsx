"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2, Power, Copy } from "lucide-react";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import SearchBar from "@/components/SearchBar";
import FilterDropdown, { type FilterOption } from "@/components/FilterDropdown";
import { Upload } from "lucide-react";
import { getFbUid } from "@/lib/getFbUid";

const traderSchema = z.object({
  name: z.string().min(1, "Bắt buộc").max(100),
  slug: z
    .string()
    .min(1, "Slug bắt buộc")
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang"),
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
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [gettingUid, setGettingUid] = useState(false);

  const handleGetFacebookUID = async (url: string) => {
    if (!url) return;

    try {
      setGettingUid(true);

      const uid = await getFbUid(url);

      // ghi UID vào field facebook
      setValue("facebook", uid);

      toast({
        title: "Đã lấy UID Facebook",
        description: uid,
      });
    } catch (err: any) {
      toast({
        title: "Không lấy được UID",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setGettingUid(false);
    }
  };

  const copyLink = (slug: string) => {
    const url = `https://admin.miyaru.online/${slug}`;

    navigator.clipboard.writeText(url);

    toast({
      title: "Đã copy link",
      description: url,
    });
  };

  const uploadAvatar = async (file: File) => {
    try {
      setUploadingAvatar(true);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setAvatarPreview(data.url);

      // gán vào form
      reset({
        ...((editTrader || {}) as any),
        avatar_url: data.url,
      });

      toast({
        title: "Upload thành công",
        description: "Avatar đã upload lên R2",
      });
    } catch (err: any) {
      toast({
        title: "Upload lỗi",
        description: err.message,
        variant: "destructive",
      });
    }

    setUploadingAvatar(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    uploadAvatar(e.target.files[0]);
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TraderForm>({
    resolver: zodResolver(traderSchema),
    defaultValues: {
      insurance_fund: 0,
      success_rate: 100,
      slug: "",
    },
  });

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

  useEffect(() => {
    fetchAll();
  }, []);

  const onSubmit = async (data: TraderForm) => {
    const payload = {
      name: data.name,
      slug: data.slug,
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
      const { error } = await supabase
        .from("traders")
        .update(payload)
        .eq("id", editTrader.id);

      if (error) {
        toast({ title: "Lỗi", description: error.message, variant: "destructive" });
        return;
      }
    } else {
      const { data: inserted, error } = await supabase
        .from("traders")
        .insert([payload])
        .select("id")
        .single();

      if (error) {
        toast({ title: "Lỗi", description: error.message, variant: "destructive" });
        return;
      }
      traderId = inserted.id;
    }

    // Xử lý danh mục
    await supabase.from("trader_categories").delete().eq("trader_id", traderId);

    if (selectedCats.length > 0) {
      await supabase
        .from("trader_categories")
        .insert(selectedCats.map(catId => ({ trader_id: traderId, category_id: catId })));
    }

    toast({
      title: editTrader ? "Đã cập nhật GDV" : "Đã thêm GDV mới",
    });

    setDialogOpen(false);
    setEditTrader(null);
    setSelectedCats([]);
    reset({ insurance_fund: 0, success_rate: 100, slug: "" });
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
    setAvatarPreview(t.avatar_url || null);
    reset({
      name: t.name,
      slug: t.slug || "",
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
    setAvatarPreview(null);
    reset({
      name: "",
      slug: "",
      code: "",
      avatar_url: "",
      service: "",
      description: "",
      insurance_fund: 0,
      success_rate: 100,
      facebook: "",
      zalo: "",
      website: "",
    });
    setDialogOpen(true);
  };

  const toggleCat = (catId: string) => {
    setSelectedCats(prev =>
      prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
    );
  };

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
    [categories]
  );

  const filtered = useMemo(
    () =>
      traders.filter(t => {
        const matchSearch =
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.code.toLowerCase().includes(search.toLowerCase());
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
        <Button onClick={openNew} className="btn-glow gap-2">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(t => {
          const catNames = getCatNames(t.id);
          return (
            <div key={t.id} className="glow-border rounded-2xl p-5 card-hover">
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
                      <span className="text-lg font-bold text-primary">{t.name.charAt(0)}</span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-foreground">{t.name}</h3>
                    <p className="text-xs text-muted-foreground">{t.service || t.code}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${t.status === "LIVE" ? "status-live" : "status-offline"
                      }`}
                  >
                    {t.status}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {Number(t.success_rate)}% thành công
                  </span>
                </div>
              </div>

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
                  onClick={() => openEdit(t)}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editTrader ? "Sửa GDV" : "Thêm GDV mới"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="sm:max-w-md max-h-[70vh] overflow-y-auto">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Tên GDV</label>
                <Input {...register("name")} placeholder="Nhập tên giao dịch viên" />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Slug URL</label>
                <Input {...register("slug")} placeholder="vd: admin-gdv" />
                {errors.slug && <p className="text-xs text-destructive mt-1">{errors.slug.message}</p>}
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Mã GDV</label>
                <Input {...register("code")} placeholder="VD: GDV#001" />
                {errors.code && <p className="text-xs text-destructive mt-1">{errors.code.message}</p>}
              </div>
              <div className="space-y-3">

                {/* Upload Avatar */}
                <div>
                  <label className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                    <Upload size={14} />
                    Upload Avatar (R2)
                  </label>

                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />

                  {uploadingAvatar && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Đang upload...
                    </p>
                  )}
                </div>

                {/* Avatar URL */}
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">
                    Avatar URL
                  </label>

                  <Input
                    {...register("avatar_url")}
                    placeholder="https://..."
                  />

                  <p className="text-xs text-muted-foreground mt-1">
                    Có thể nhập URL ngoài hoặc upload trực tiếp.
                  </p>
                </div>

                {/* Preview */}
                {avatarPreview && (
                  <div className="flex justify-center">
                    <img
                      src={avatarPreview}
                      className="w-16 h-16 rounded-full object-cover border border-border"
                      alt="Avatar preview"
                    />
                  </div>
                )}

              </div>

              {categories.length > 0 && (
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Danh mục</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleCat(c.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${selectedCats.includes(c.id)
                          ? "bg-primary/20 text-primary border-primary/40"
                          : "border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                          }`}
                      >
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
                  <label className="text-sm text-muted-foreground mb-1 block">Facebook URL</label>
                  <div className="flex gap-2">
                    <Input
                      {...register("facebook")}
                      placeholder="https://facebook.com/username"
                    />

                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        const input = (e.currentTarget.parentElement?.querySelector("input") as HTMLInputElement);
                        if (input?.value) handleGetFacebookUID(input.value);
                      }}
                      disabled={gettingUid}
                    >
                      {gettingUid ? "..." : "Lấy UID"}
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Zalo (SĐT)</label>
                  <Input {...register("zalo")} placeholder="Nhập số điện thoại Zalo" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Website</label>
                  <Input {...register("website")} placeholder="Nhập địa chỉ website" />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full btn-glow">
              {editTrader ? "Cập nhật" : "Thêm mới"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

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

export default Traders;
