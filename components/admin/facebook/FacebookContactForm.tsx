"use client";

import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, Loader2, ImageIcon, UserCircle2 } from "lucide-react";

/* ─── Types ──────────────────────────────────────────────── */
interface FormValues {
  title: string;
  branch_name: string;
  platform: string;
  platform_logo_url: string;
  platform_avatar_url: string;
  contact_url: string;
  support_text: string;
  display_order: number;
  is_active: boolean;
}

interface Props {
  open: boolean;
  initial?: Partial<FormValues>;
  onClose: () => void;
  onSubmit: (values: FormValues) => Promise<void> | void;
}

const defaultValues: FormValues = {
  title: "",
  branch_name: "",
  platform: "facebook",
  platform_logo_url: "",
  platform_avatar_url: "",
  contact_url: "",
  support_text: "",
  display_order: 0,
  is_active: true,
};

/* ─── Upload Hook ─────────────────────────────────────────── */
function useImageUpload(
  setField: (key: keyof FormValues, value: string) => void,
  field: keyof FormValues,
) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload thất bại");
      setField(field, data.url);
    } catch (err: any) {
      // bubble lên để form bắt
      throw err;
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    upload(e.target.files[0]).catch(() => {});
  };

  return { uploading, inputRef, handleChange };
}

/* ─── Image Field ─────────────────────────────────────────── */
interface ImageFieldProps {
  label: string;
  name: keyof FormValues;
  value: string;
  placeholder?: string;
  previewShape?: "square" | "circle";
  previewIcon?: React.ReactNode;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  uploading: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadError?: string | null;
  setUploadError?: (v: string | null) => void;
}

const ImageField: React.FC<ImageFieldProps> = ({
  label, name, value, placeholder, previewShape = "square",
  previewIcon, onChange, onClear, uploading, inputRef, onFileChange,
}) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
      {previewIcon}
      {label}
    </label>

    {/* URL input */}
    <div className="relative">
      <Input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder || "https://..."}
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-destructive transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>

    {/* Upload button */}
    <label className={`
      inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border
      bg-muted hover:bg-muted/70 transition-colors cursor-pointer text-xs text-muted-foreground w-fit
      ${uploading ? "opacity-60 pointer-events-none" : ""}
    `}>
      {uploading
        ? <><Loader2 size={13} className="animate-spin" /> Đang upload...</>
        : <><Upload size={13} /> Tải ảnh lên</>
      }
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
        disabled={uploading}
      />
    </label>

    {/* Preview */}
    {value && (
      <div className="flex items-center gap-3 p-2 rounded-xl bg-muted/40 border border-border mt-1">
        <img
          src={value}
          alt="preview"
          className={`
            w-12 h-12 object-cover border-2 border-border shrink-0
            ${previewShape === "circle" ? "rounded-full" : "rounded-lg object-contain p-0.5 bg-background"}
          `}
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{value}</p>
      </div>
    )}
  </div>
);

/* ─── Main Component ─────────────────────────────────────── */
const FacebookContactForm: React.FC<Props> = ({ open, initial, onClose, onSubmit }) => {
  const [values, setValues] = useState<FormValues>(defaultValues);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const setField = (key: keyof FormValues, value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const logoUpload = useImageUpload(setField, "platform_logo_url");
  const avatarUpload = useImageUpload(setField, "platform_avatar_url");

  useEffect(() => {
    if (open) {
      setValues({ ...defaultValues, ...initial });
      setError(null);
      setSubmitting(false);
    }
  }, [open, initial]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const target = e.target;
    const { name, value, type } = target;
    const checked = target instanceof HTMLInputElement ? target.checked : false;
    setValues((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked
        : name === "display_order" ? Number(value) || 0
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.contact_url.trim()) {
      setError("Liên kết liên hệ (contact_url) là bắt buộc.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(values);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể lưu liên hệ, thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const isUploading = logoUpload.uploading || avatarUpload.uploading;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">

        {/* Fixed header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-lg font-bold">
            {initial?.title ? "Chỉnh sửa liên hệ" : "Thêm liên hệ mới"}
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable body */}
        <ScrollArea className="max-h-[65vh]">
          <form id="contact-form" onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

            {/* Error banner */}
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* Row 1: Tiêu đề + Chi nhánh */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground block">Tiêu đề</label>
                <Input name="title" value={values.title} onChange={handleChange} placeholder="VD: CSKH Facebook" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground block">Chi nhánh</label>
                <Input name="branch_name" value={values.branch_name} onChange={handleChange} placeholder="VD: HN, HCM..." />
              </div>
            </div>

            {/* Row 2: Nền tảng + Thứ tự */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground block">Nền tảng</label>
                <select
                  name="platform"
                  value={values.platform}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="facebook">Facebook</option>
                  <option value="zalo">Zalo</option>
                  <option value="telegram">Telegram</option>
                  <option value="other">Khác</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground block">Thứ tự hiển thị</label>
                <Input
                  type="number"
                  name="display_order"
                  value={values.display_order}
                  onChange={handleChange}
                  min={0}
                />
              </div>
            </div>

            {/* Contact URL */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground block">
                Liên kết liên hệ
                <span className="text-destructive ml-1">*</span>
              </label>
              <Input
                name="contact_url"
                value={values.contact_url}
                onChange={handleChange}
                placeholder="https://m.me/... hoặc https://zalo.me/..."
                className={!values.contact_url && error ? "border-destructive" : ""}
              />
            </div>

            {/* Logo + Avatar upload fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <ImageField
                label="Logo nền tảng"
                name="platform_logo_url"
                value={values.platform_logo_url}
                placeholder="https://..."
                previewShape="square"
                previewIcon={<ImageIcon size={13} className="text-muted-foreground" />}
                onChange={handleChange}
                onClear={() => setField("platform_logo_url", "")}
                uploading={logoUpload.uploading}
                inputRef={logoUpload.inputRef}
                onFileChange={(e) => {
                  logoUpload.handleChange(e);
                  setError(null);
                }}
              />

              <ImageField
                label="Avatar admin"
                name="platform_avatar_url"
                value={values.platform_avatar_url}
                placeholder="https://..."
                previewShape="circle"
                previewIcon={<UserCircle2 size={13} className="text-muted-foreground" />}
                onChange={handleChange}
                onClear={() => setField("platform_avatar_url", "")}
                uploading={avatarUpload.uploading}
                inputRef={avatarUpload.inputRef}
                onFileChange={(e) => {
                  avatarUpload.handleChange(e);
                  setError(null);
                }}
              />
            </div>

            {/* Support text */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground block">Nội dung hỗ trợ</label>
              <textarea
                name="support_text"
                value={values.support_text}
                onChange={handleChange}
                rows={3}
                placeholder="VD: Hỗ trợ 24/7, phản hồi trong vòng 5 phút..."
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
            </div>

          </form>
        </ScrollArea>

        {/* Fixed footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-card gap-4">
          {/* Checkbox is_active */}
          <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              name="is_active"
              checked={values.is_active}
              onChange={handleChange}
              className="rounded border-border bg-background accent-primary w-4 h-4"
            />
            Hiển thị cho user
          </label>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button
              type="submit"
              form="contact-form"
              disabled={submitting || isUploading}
              className="btn-glow min-w-[90px]"
            >
              {submitting
                ? <><Loader2 size={14} className="animate-spin mr-1" /> Đang lưu...</>
                : isUploading
                  ? <><Loader2 size={14} className="animate-spin mr-1" /> Upload...</>
                  : "Lưu"
              }
            </Button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
};

export default FacebookContactForm;