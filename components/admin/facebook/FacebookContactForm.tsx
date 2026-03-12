"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

const FacebookContactForm: React.FC<Props> = ({
  open,
  initial,
  onClose,
  onSubmit,
}) => {
  const [values, setValues] = useState<FormValues>(defaultValues);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
    const name = target.name;
    const value = target.value;
    const type = target.type;
    const checked = target instanceof HTMLInputElement ? target.checked : false;
    setValues(prev => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "display_order"
            ? Number(value) || 0
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
    try {
      await onSubmit(values);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể lưu liên hệ, thử lại.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial?.title ? "Sửa liên hệ" : "Thêm liên hệ"}</DialogTitle>
        </DialogHeader>

        {error && (
          <p className="text-sm text-destructive bg-destructive/10 border border-destructive/40 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Tiêu đề</label>
                <Input name="title" value={values.title} onChange={handleChange} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Chi nhánh</label>
                <Input name="branch_name" value={values.branch_name} onChange={handleChange} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Nền tảng</label>
                <select
                  name="platform"
                  value={values.platform}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="facebook">Facebook</option>
                  <option value="zalo">Zalo</option>
                  <option value="telegram">Telegram</option>
                  <option value="other">Khác</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Thứ tự hiển thị</label>
                <Input
                  type="number"
                  name="display_order"
                  value={values.display_order}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Liên kết liên hệ (bắt buộc)</label>
              <Input name="contact_url" value={values.contact_url} onChange={handleChange} placeholder="https://..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Logo nền tảng (URL)</label>
                <Input name="platform_logo_url" value={values.platform_logo_url} onChange={handleChange} placeholder="https://..." />
                {values.platform_logo_url && (
                  <div className="mt-2 w-16 h-16 rounded-lg border border-border bg-background flex items-center justify-center overflow-hidden">
                    <img src={values.platform_logo_url} alt="Logo preview" className="w-full h-full object-contain" />
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Avatar admin (URL)</label>
                <Input name="platform_avatar_url" value={values.platform_avatar_url} onChange={handleChange} placeholder="https://..." />
                {values.platform_avatar_url && (
                  <div className="mt-2 w-16 h-16 rounded-full border border-border bg-background flex items-center justify-center overflow-hidden">
                    <img src={values.platform_avatar_url} alt="Avatar preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Nội dung hỗ trợ</label>
              <textarea
                name="support_text"
                value={values.support_text}
                onChange={handleChange}
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <input
                type="checkbox"
                name="is_active"
                checked={values.is_active}
                onChange={handleChange}
                className="rounded border-border bg-background"
              />
              Hiển thị cho user
            </label>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button type="submit" disabled={submitting} className="btn-glow">
                {submitting ? "Đang lưu..." : "Lưu"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FacebookContactForm;

