"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Upload, ArrowLeft, Plus, Trash2,
  Building2, ChevronDown, QrCode,
  CreditCard, User,
} from "lucide-react";
import { getFbUid } from "@/lib/getFbUid";
import Image from "next/image";

// ─── Types ─────────────────────────────────────────────────────────────────────

type VietQRBank = {
  bin: string;
  short_name: string;
  name: string;
  logo: string;
};

// ─── Schema ────────────────────────────────────────────────────────────────────

const bankEntrySchema = z.object({
  bank_name: z.string().min(1, "Chọn ngân hàng"),
  account_number: z.string().min(1, "Bắt buộc"),
  account_holder: z.string().min(1, "Bắt buộc"),
});

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
  banks: z.array(bankEntrySchema).default([]),
});

type TraderForm = z.infer<typeof traderSchema>;

interface Category {
  id: string;
  name: string;
}

// ─── BankRow Component ─────────────────────────────────────────────────────────

function BankRow({
  index,
  vietqrBanks,
  value,
  onBankSelect,
  onAccountNumberChange,
  onAccountHolderChange,
  onRemove,
  errors,
}: {
  index: number;
  vietqrBanks: VietQRBank[];
  value: { bank_name: string; account_number: string; account_holder: string };
  onBankSelect: (bank: VietQRBank) => void;
  onAccountNumberChange: (v: string) => void;
  onAccountHolderChange: (v: string) => void;
  onRemove: () => void;
  errors?: Partial<Record<keyof z.infer<typeof bankEntrySchema>, { message?: string }>>;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedBank =
    vietqrBanks.find((b) => b.short_name === value.bank_name) ?? null;

  const filtered = vietqrBanks.filter(
    (b) =>
      b.short_name.toLowerCase().includes(search.toLowerCase()) ||
      b.name.toLowerCase().includes(search.toLowerCase())
  );

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      )
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const formatAccNum = (v: string) =>
    v.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();

  const cleanAccNum = value.account_number?.replace(/\s/g, "");

  const qrLink =
    value.bank_name && cleanAccNum && value.account_holder
      ? `https://img.vietqr.io/image/${encodeURIComponent(value.bank_name)}-${cleanAccNum}-compact2.png?amount=0&addInfo=&accountName=${encodeURIComponent(value.account_holder)}`
      : null;

  return (
    <div className="border border-border rounded-2xl p-4 bg-card/60 space-y-3">
      {/* Row header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
          Tài khoản #{index + 1}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
        >
          <Trash2 size={13} />
        </Button>
      </div>

      {/* Bank selector */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center gap-2.5 h-10 px-3 rounded-xl border border-input bg-background text-sm
            hover:border-ring/50 focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
        >
          {selectedBank?.logo ? (
            <Image
              src={selectedBank.logo}
              alt={selectedBank.short_name}
              width={18}
              height={18}
              className="rounded object-contain shrink-0"
              unoptimized
            />
          ) : (
            <Building2 size={15} className="text-muted-foreground shrink-0" />
          )}
          <span
            className={`flex-1 text-left truncate ${
              !selectedBank ? "text-muted-foreground" : ""
            }`}
          >
            {selectedBank
              ? `${selectedBank.short_name} — ${selectedBank.name}`
              : "Chọn ngân hàng"}
          </span>
          <ChevronDown
            size={14}
            className={`text-muted-foreground shrink-0 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {open && (
          <div className="absolute z-50 mt-1.5 w-full bg-popover border rounded-xl shadow-lg overflow-hidden">
            <div className="p-2 border-b">
              <Input
                autoFocus
                placeholder="Tìm ngân hàng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-sm text-center text-muted-foreground py-3">
                  Không tìm thấy
                </p>
              ) : (
                filtered.map((b) => (
                  <button
                    key={b.bin}
                    type="button"
                    onClick={() => {
                      onBankSelect(b);
                      setSearch("");
                      setOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted text-left transition-colors
                      ${value.bank_name === b.short_name ? "bg-muted/70 font-medium" : ""}`}
                  >
                    {b.logo && (
                      <Image
                        src={b.logo}
                        alt={b.short_name}
                        width={18}
                        height={18}
                        className="rounded object-contain shrink-0"
                        unoptimized
                      />
                    )}
                    <span className="font-medium shrink-0">{b.short_name}</span>
                    <span className="text-muted-foreground truncate">{b.name}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
        {errors?.bank_name && (
          <p className="text-xs text-destructive mt-1">{errors.bank_name.message}</p>
        )}
      </div>

      {/* Inputs + QR side by side */}
      <div className="flex gap-3 items-start">
        {/* Inputs */}
        <div className="flex-1 space-y-2.5">
          {/* Account number */}
          <div className="relative">
            <CreditCard
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <Input
              value={value.account_number}
              onChange={(e) => onAccountNumberChange(formatAccNum(e.target.value))}
              placeholder="Số tài khoản"
              className="pl-8 font-mono tracking-wider text-sm"
              maxLength={19}
            />
            {errors?.account_number && (
              <p className="text-xs text-destructive mt-1">
                {errors.account_number.message}
              </p>
            )}
          </div>

          {/* Account holder */}
          <div className="relative">
            <User
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <Input
              value={value.account_holder}
              onChange={(e) =>
                onAccountHolderChange(e.target.value.toUpperCase())
              }
              placeholder="Chủ tài khoản"
              className="pl-8 uppercase tracking-wide text-sm"
            />
            {errors?.account_holder && (
              <p className="text-xs text-destructive mt-1">
                {errors.account_holder.message}
              </p>
            )}
          </div>
        </div>

        {/* QR preview */}
        <div
          className={`w-[84px] h-[84px] shrink-0 rounded-xl border overflow-hidden flex items-center justify-center transition-all duration-300
            ${qrLink ? "border-border/50 bg-white" : "border-dashed border-border/30 bg-muted/20"}`}
        >
          {qrLink ? (
            <Image
              src={qrLink}
              alt="VietQR"
              width={84}
              height={84}
              className="w-full h-full object-contain"
              unoptimized
            />
          ) : (
            <QrCode size={22} className="text-muted-foreground/25" />
          )}
        </div>
      </div>

      {/* Bank badge */}
      {selectedBank && (
        <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border border-border/30 rounded-xl">
          {selectedBank.logo && (
            <Image
              src={selectedBank.logo}
              alt={selectedBank.short_name}
              width={22}
              height={22}
              className="rounded-md object-contain shrink-0"
              unoptimized
            />
          )}
          <div>
            <p className="text-xs font-semibold leading-tight">
              {selectedBank.short_name}
            </p>
            <p className="text-[11px] text-muted-foreground leading-tight">
              {selectedBank.name}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

const AddTraderPage = () => {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [gettingUid, setGettingUid] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // VietQR banks
  const [vietqrBanks, setVietqrBanks] = useState<VietQRBank[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<TraderForm>({
    resolver: zodResolver(traderSchema),
    defaultValues: {
      insurance_fund: 0,
      success_rate: 100,
      slug: "",
      banks: [],
    },
  });

  // useFieldArray for banks
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "banks",
  });

  const watchedAvatarUrl = watch("avatar_url");
  const watchedBanks = watch("banks");

  useEffect(() => {
    if (watchedAvatarUrl) setAvatarPreview(watchedAvatarUrl);
  }, [watchedAvatarUrl]);

  // Fetch categories
  useEffect(() => {
    supabase
      .from("categories")
      .select("*")
      .order("name")
      .then(({ data }) => setCategories((data as Category[]) || []));
  }, []);

  // Fetch VietQR banks
  useEffect(() => {
    fetch("https://api.vietqr.io/v2/banks")
      .then((r) => r.json())
      .then((data) => {
        if (data.code === "00") {
          setVietqrBanks(
            data.data.sort((a: VietQRBank, b: VietQRBank) =>
              a.short_name.localeCompare(b.short_name)
            )
          );
        }
      })
      .catch(() =>
        toast({ title: "Không tải được danh sách ngân hàng", variant: "destructive" })
      )
      .finally(() => setLoadingBanks(false));
  }, []);

  // ── Upload avatar ─────────────────────────────────────────────────────────────

  const uploadAvatar = async (file: File) => {
    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setValue("avatar_url", data.url);
      setAvatarPreview(data.url);
      toast({ title: "Upload thành công", description: "Avatar đã upload lên R2" });
    } catch (err: any) {
      toast({ title: "Upload lỗi", description: err.message, variant: "destructive" });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    uploadAvatar(e.target.files[0]);
  };

  // ── Facebook UID ──────────────────────────────────────────────────────────────

  const handleGetFacebookUID = async (url: string) => {
    if (!url) return;
    try {
      setGettingUid(true);
      const uid = await getFbUid(url);
      setValue("facebook", uid);
      toast({ title: "Đã lấy UID Facebook", description: uid });
    } catch (err: any) {
      toast({ title: "Không lấy được UID", description: err.message, variant: "destructive" });
    } finally {
      setGettingUid(false);
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────────

  const onSubmit = async (data: TraderForm) => {
    setSubmitting(true);

    // Strip spaces from account numbers before saving
    const cleanedBanks = data.banks.map((b) => ({
      ...b,
      account_number: b.account_number.replace(/\s/g, ""),
    }));

    const payload = {
      name: data.name,
      slug: data.slug,
      code: data.code,
      avatar_url: data.avatar_url || null,
      service: data.service || "",
      description: data.description || "",
      insurance_fund: data.insurance_fund,
      success_rate: data.success_rate,
      status: "LIVE",
      facebook: data.facebook || null,
      zalo: data.zalo || null,
      website: data.website || null,
      banks: cleanedBanks,           // ← jsonb column
    };

    const { data: inserted, error } = await supabase
      .from("traders")
      .insert([payload])
      .select("id")
      .single();

    if (error) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    if (selectedCats.length > 0) {
      await supabase
        .from("trader_categories")
        .insert(
          selectedCats.map((catId) => ({
            trader_id: inserted.id,
            category_id: catId,
          }))
        );
    }

    toast({ title: "Đã thêm GDV mới" });
    setSubmitting(false);
    router.push("/traders");
  };

  const toggleCat = (catId: string) => {
    setSelectedCats((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/traders")}
        >
          <ArrowLeft size={18} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Thêm giao dịch viên mới
          </h1>
          <p className="text-sm text-muted-foreground">Điền đầy đủ thông tin GDV</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Tên */}
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Tên GDV</label>
          <Input {...register("name")} placeholder="Nhập tên giao dịch viên" />
          {errors.name && (
            <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Slug */}
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Slug URL</label>
          <Input {...register("slug")} placeholder="vd: nguyen-van-a" />
          {errors.slug && (
            <p className="text-xs text-destructive mt-1">{errors.slug.message}</p>
          )}
        </div>

        {/* Biệt danh */}
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Biệt danh</label>
          <Input {...register("service")} placeholder="Nhập biệt danh" />
        </div>

        {/* Mã GDV */}
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Mã GDV</label>
          <Input {...register("code")} placeholder="VD: GDV#001" />
          {errors.code && (
            <p className="text-xs text-destructive mt-1">{errors.code.message}</p>
          )}
        </div>

        {/* Avatar */}
        <div className="space-y-3">
          <div>
            <label className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
              <Upload size={14} /> Upload Avatar (R2)
            </label>
            <Input type="file" accept="image/*" onChange={handleAvatarChange} />
            {uploadingAvatar && (
              <p className="text-xs text-muted-foreground mt-1">Đang upload...</p>
            )}
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">
              Avatar URL
            </label>
            <Input {...register("avatar_url")} placeholder="https://..." />
            <p className="text-xs text-muted-foreground mt-1">
              Có thể nhập URL ngoài hoặc upload trực tiếp.
            </p>
          </div>
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

        {/* Danh mục */}
        {categories.length > 0 && (
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Danh mục
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleCat(c.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    selectedCats.includes(c.id)
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

        {/* Quỹ BH & Thành công */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">
              Quỹ bảo hiểm
            </label>
            <Input {...register("insurance_fund")} type="number" placeholder="0" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">
              % Thành công
            </label>
            <Input {...register("success_rate")} type="number" placeholder="100" />
          </div>
        </div>

        {/* Mô tả */}
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Mô tả</label>
          <Input {...register("description")} placeholder="Nhập mô tả" />
        </div>

        {/* ══════════════════════════════════════════════════════════
            TÀI KHOẢN NGÂN HÀNG (jsonb banks[])
        ═══════════════════════════════════════════════════════════ */}
        <div className="border-t border-border pt-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Tài khoản ngân hàng
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loadingBanks}
              onClick={() =>
                append({ bank_name: "", account_number: "", account_holder: "" })
              }
              className="h-8 gap-1.5 text-xs"
            >
              <Plus size={13} />
              Thêm tài khoản
            </Button>
          </div>

          {fields.length === 0 && (
            <div className="flex items-center justify-center py-8 border border-dashed border-border/40 rounded-2xl bg-muted/10">
              <div className="text-center space-y-1">
                <QrCode size={28} className="mx-auto text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground/50">
                  Chưa có tài khoản ngân hàng
                </p>
              </div>
            </div>
          )}

          {fields.map((field, index) => (
            <BankRow
              key={field.id}
              index={index}
              vietqrBanks={vietqrBanks}
              value={watchedBanks?.[index] ?? field}
              onBankSelect={(bank) =>
                update(index, {
                  ...watchedBanks[index],
                  bank_name: bank.short_name,
                })
              }
              onAccountNumberChange={(v) =>
                update(index, {
                  ...watchedBanks[index],
                  account_number: v,
                })
              }
              onAccountHolderChange={(v) =>
                update(index, {
                  ...watchedBanks[index],
                  account_holder: v,
                })
              }
              onRemove={() => remove(index)}
              errors={
                errors.banks?.[index] as Partial<
                  Record<keyof z.infer<typeof bankEntrySchema>, { message?: string }>
                >
              }
            />
          ))}

          {fields.length > 0 && (
            <p className="text-xs text-muted-foreground text-center">
              {fields.length} tài khoản · Dữ liệu được lưu dưới dạng JSON
            </p>
          )}
        </div>

        {/* Liên kết */}
        <div className="border-t border-border pt-5 space-y-4">
          <p className="text-sm font-medium text-muted-foreground">Liên kết</p>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">
              Facebook URL / UID
            </label>
            <div className="flex gap-2">
              <Input
                {...register("facebook")}
                placeholder="https://facebook.com/username"
              />
              <Button
                type="button"
                variant="outline"
                disabled={gettingUid}
                onClick={(e) => {
                  const input =
                    e.currentTarget.previousElementSibling as HTMLInputElement;
                  if (input?.value) handleGetFacebookUID(input.value);
                }}
              >
                {gettingUid ? "..." : "Lấy UID"}
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">
              Zalo (SĐT)
            </label>
            <Input {...register("zalo")} placeholder="Nhập số điện thoại Zalo" />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Website</label>
            <Input {...register("website")} placeholder="Nhập địa chỉ website" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => router.push("/traders")}
          >
            Huỷ
          </Button>
          <Button
            type="submit"
            className="flex-1 btn-glow"
            disabled={submitting}
          >
            {submitting ? "Đang lưu..." : "Thêm mới"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddTraderPage;