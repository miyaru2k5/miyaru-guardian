"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2, Eye, EyeOff, Copy, Landmark } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";

/* ─── Schema ─────────────────────────────────────────────── */
const bankSchema = z.object({
  bank_name: z.string().min(1, "Bắt buộc").max(100),
  account_number: z.string().min(1, "Bắt buộc").max(50),
  account_holder: z.string().min(1, "Bắt buộc").max(100),
  logo_url: z.string().max(500).optional(),
  qr_image_url: z.string().max(500).optional(),
});

type BankForm = z.infer<typeof bankSchema>;

/* ─── Component ──────────────────────────────────────────── */
const Banks = () => {
  const [banks, setBanks] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editBank, setEditBank] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState<"logo" | "qr" | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BankForm>({ resolver: zodResolver(bankSchema) });

  const logoUrl = watch("logo_url");
  const qrUrl = watch("qr_image_url");

  useEffect(() => { setLogoPreview(logoUrl || null); }, [logoUrl]);
  useEffect(() => { setQrPreview(qrUrl || null); }, [qrUrl]);

  /* ── Fetch ── */
  const fetchBanks = async () => {
    const { data } = await supabase
      .from("bank_accounts")
      .select("*")
      .order("created_at", { ascending: false });
    setBanks(data || []);
  };

  useEffect(() => { fetchBanks(); }, []);

  /* ── Upload ── */
  const uploadImage = async (file: File, type: "logo" | "qr") => {
    setUploading(type);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (type === "logo") {
        setValue("logo_url", data.url);
        setLogoPreview(data.url);
      } else {
        setValue("qr_image_url", data.url);
        setQrPreview(data.url);
      }
      toast({ title: "Upload thành công" });
    } catch (err: any) {
      toast({ title: "Upload lỗi", description: err.message, variant: "destructive" });
    } finally {
      setUploading(null);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "qr") => {
    if (!e.target.files?.length) return;
    uploadImage(e.target.files[0], type);
    e.target.value = "";
  };

  /* ── Submit ── */
  const onSubmit = async (data: BankForm) => {
    const payload = {
      bank_name: data.bank_name,
      account_number: data.account_number,
      account_holder: data.account_holder,
      logo_url: data.logo_url || null,
      qr_image_url: data.qr_image_url || null,
    };

    const { error } = editBank
      ? await supabase.from("bank_accounts").update(payload).eq("id", editBank.id)
      : await supabase.from("bank_accounts").insert([payload]);

    if (error) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: editBank ? "Đã cập nhật" : "Đã thêm ngân hàng" });
    closeDialog();
    fetchBanks();
  };

  /* ── Helpers ── */
  const openAddDialog = () => {
    setEditBank(null);
    setLogoPreview(null);
    setQrPreview(null);
    reset({ bank_name: "", account_number: "", account_holder: "", logo_url: "", qr_image_url: "" });
    setDialogOpen(true);
  };

  const openEditDialog = (b: any) => {
    setEditBank(b);
    setLogoPreview(b.logo_url || null);
    setQrPreview(b.qr_image_url || null);
    reset({
      bank_name: b.bank_name,
      account_number: b.account_number,
      account_holder: b.account_holder,
      logo_url: b.logo_url || "",
      qr_image_url: b.qr_image_url || "",
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditBank(null);
    reset();
  };

  const toggleVisibility = async (b: any) => {
    await supabase.from("bank_accounts").update({ is_visible: !b.is_visible }).eq("id", b.id);
    fetchBanks();
  };

  const deleteBank = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("bank_accounts").delete().eq("id", deleteId);
    if (error) {
      toast({ title: "Lỗi xóa", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Đã xóa ngân hàng" });
    setDeleteId(null);
    fetchBanks();
  };

  const copyAccount = (num: string) => {
    navigator.clipboard.writeText(num);
    toast({ title: "Đã copy số tài khoản" });
  };

  /* ─── Render ────────────────────────────────────────────── */
  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ngân hàng</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Quản lý tài khoản ngân hàng nhận tiền
          </p>
        </div>

        <Button onClick={openAddDialog} className="btn-glow gap-2">
          <Plus size={16} /> Thêm ngân hàng
        </Button>
      </div>

      {/* EMPTY STATE */}
      {banks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
          <Landmark size={40} className="opacity-30" />
          <p className="text-sm">Chưa có ngân hàng nào. Hãy thêm mới!</p>
        </div>
      )}

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banks.map((b) => (
          <div
            key={b.id}
            className={`
              glow-border rounded-2xl p-5 card-hover transition-all duration-200
              bg-card border border-border
              ${!b.is_visible ? "opacity-50 grayscale" : ""}
            `}
          >
            {/* Card header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {b.logo_url ? (
                  <img
                    src={b.logo_url}
                    alt={b.bank_name}
                    className="w-9 h-9 rounded-lg object-contain border border-border bg-muted p-0.5"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                    <Landmark size={18} className="text-muted-foreground" />
                  </div>
                )}
                <div>
                  <h3 className="text-base font-bold text-foreground leading-tight">
                    {b.bank_name}
                  </h3>
                  <span className="text-xs text-muted-foreground">{b.account_holder}</span>
                </div>
              </div>

              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  b.is_visible
                    ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30"
                    : "bg-muted text-muted-foreground ring-1 ring-border"
                }`}
              >
                {b.is_visible ? "Hiện" : "Ẩn"}
              </span>
            </div>

            {/* Info rows */}
            <div className="rounded-xl bg-muted/40 divide-y divide-border/50 mb-4 overflow-hidden">
              <div className="flex justify-between items-center px-3 py-2">
                <span className="text-xs text-muted-foreground">Số tài khoản</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold text-foreground tracking-wide">
                    {b.account_number}
                  </span>
                  <button
                    onClick={() => copyAccount(b.account_number)}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    title="Copy"
                  >
                    <Copy size={13} />
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center px-3 py-2">
                <span className="text-xs text-muted-foreground">Chủ tài khoản</span>
                <span className="text-sm font-medium text-foreground uppercase tracking-wide">
                  {b.account_holder}
                </span>
              </div>
            </div>

            {/* QR */}
            {b.qr_image_url && (
              <div className="flex justify-center mb-4">
                <img
                  src={b.qr_image_url}
                  alt="QR Code"
                  className="w-24 h-24 rounded-xl border-2 border-border object-cover shadow-sm"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => toggleVisibility(b)}
                className="flex-1 gap-1.5 text-xs h-8"
              >
                {b.is_visible ? (
                  <><EyeOff size={13} /> Ẩn</>
                ) : (
                  <><Eye size={13} /> Hiện</>
                )}
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => openEditDialog(b)}
                className="gap-1.5 text-xs h-8 px-3"
              >
                <Edit size={13} /> Sửa
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setDeleteId(b.id)}
                className="text-destructive hover:bg-destructive/10 hover:border-destructive/50 h-8 px-3"
              >
                <Trash2 size={13} />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* ── ADD / EDIT DIALOG ── */}
      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">

          {/* Dialog header — fixed */}
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
            <DialogTitle className="text-lg font-bold">
              {editBank ? "Chỉnh sửa ngân hàng" : "Thêm ngân hàng mới"}
            </DialogTitle>
          </DialogHeader>

          {/* Scrollable form body */}
          <ScrollArea className="max-h-[65vh]">
            <form
              id="bank-form"
              onSubmit={handleSubmit(onSubmit)}
              className="px-6 py-5 space-y-5"
            >

              {/* Tên ngân hàng */}
              <FieldGroup label="Tên ngân hàng" error={errors.bank_name?.message}>
                <Input
                  {...register("bank_name")}
                  placeholder="VD: Vietcombank, MB Bank..."
                  className={errors.bank_name ? "border-destructive" : ""}
                />
              </FieldGroup>

              {/* Số tài khoản */}
              <FieldGroup label="Số tài khoản" error={errors.account_number?.message}>
                <Input
                  {...register("account_number")}
                  placeholder="VD: 0123456789"
                  className={`font-mono ${errors.account_number ? "border-destructive" : ""}`}
                />
              </FieldGroup>

              {/* Chủ tài khoản */}
              <FieldGroup label="Chủ tài khoản" error={errors.account_holder?.message}>
                <Input
                  {...register("account_holder")}
                  placeholder="VD: NGUYEN VAN A"
                  className={`uppercase ${errors.account_holder ? "border-destructive" : ""}`}
                />
              </FieldGroup>

              {/* Logo */}
              <FieldGroup label="Logo ngân hàng">
                <Input
                  {...register("logo_url")}
                  placeholder="Nhập URL logo..."
                  className="mb-2"
                />
                <label className="flex items-center gap-2 cursor-pointer w-fit">
                  <span className="text-xs px-3 py-1.5 rounded-lg border border-border bg-muted hover:bg-muted/70 transition-colors text-muted-foreground">
                    {uploading === "logo" ? "Đang upload..." : "Chọn ảnh logo"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUpload(e, "logo")}
                    className="hidden"
                    disabled={uploading === "logo"}
                  />
                </label>
                {logoPreview && (
                  <div className="mt-2 flex items-center gap-3">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-12 h-12 rounded-lg object-contain border border-border bg-muted p-1"
                    />
                    <span className="text-xs text-muted-foreground">Xem trước logo</span>
                  </div>
                )}
              </FieldGroup>

              {/* QR */}
              <FieldGroup label="Mã QR thanh toán">
                <Input
                  {...register("qr_image_url")}
                  placeholder="Nhập URL ảnh QR..."
                  className="mb-2"
                />
                <label className="flex items-center gap-2 cursor-pointer w-fit">
                  <span className="text-xs px-3 py-1.5 rounded-lg border border-border bg-muted hover:bg-muted/70 transition-colors text-muted-foreground">
                    {uploading === "qr" ? "Đang upload..." : "Chọn ảnh QR"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUpload(e, "qr")}
                    className="hidden"
                    disabled={uploading === "qr"}
                  />
                </label>
                {qrPreview && (
                  <div className="mt-2 flex items-center gap-3">
                    <img
                      src={qrPreview}
                      alt="QR preview"
                      className="w-20 h-20 rounded-xl border-2 border-border object-cover"
                    />
                    <span className="text-xs text-muted-foreground">Xem trước QR</span>
                  </div>
                )}
              </FieldGroup>

            </form>
          </ScrollArea>

          {/* Dialog footer — fixed */}
          <div className="px-6 py-4 border-t border-border flex gap-2 bg-card">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={closeDialog}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              form="bank-form"
              className="flex-1 btn-glow"
              disabled={isSubmitting || !!uploading}
            >
              {isSubmitting
                ? "Đang lưu..."
                : editBank
                  ? "Cập nhật"
                  : "Thêm mới"}
            </Button>
          </div>

        </DialogContent>
      </Dialog>

      {/* CONFIRM DELETE */}
      <ConfirmDeleteDialog
        open={!!deleteId}
        title="Xác nhận xóa ngân hàng"
        description="Hành động này không thể hoàn tác. Bạn có chắc muốn xóa ngân hàng này không?"
        onClose={() => setDeleteId(null)}
        onConfirm={deleteBank}
      />

    </div>
  );
};

/* ─── FieldGroup helper ───────────────────────────────────── */
const FieldGroup = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-foreground">{label}</label>
    {children}
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
);

export default Banks;