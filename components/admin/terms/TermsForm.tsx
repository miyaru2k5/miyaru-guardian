"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TermsEditor from "./TermsEditor";

interface FormValues {
  title: string;
  slug: string;
  content: string;
  display_order: number;
  is_published: boolean;
}

interface Props {
  open: boolean;
  initial?: Partial<FormValues>;
  onClose: () => void;
  onSubmit: (values: FormValues) => Promise<void> | void;
}

const defaultValues: FormValues = {
  title: "",
  slug: "",
  content: "",
  display_order: 0,
  is_published: false,
};

const TermsForm: React.FC<Props> = ({ open, initial, onClose, onSubmit }) => {
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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
    if (!values.title.trim() || !values.slug.trim()) {
      setError("Title và slug là bắt buộc.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        ...values,
        slug: values.slug.trim().toLowerCase(),
      });
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể lưu điều khoản.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initial?.title ? "Sửa điều khoản" : "Thêm điều khoản"}</DialogTitle>
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
              <Input
                name="title"
                value={values.title}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Slug (đường dẫn)</label>
              <Input
                name="slug"
                value={values.slug}
                onChange={handleChange}
                placeholder="vi-du-slug"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Thứ tự hiển thị</label>
              <Input
                type="number"
                name="display_order"
                value={values.display_order}
                onChange={handleChange}
              />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  name="is_published"
                  checked={values.is_published}
                  onChange={handleChange}
                  className="rounded border-border bg-background"
                />
                Công khai cho user
              </label>
            </div>
          </div>

          <div>
            <TermsEditor
              value={values.content}
              onChange={content => setValues(prev => ({ ...prev, content }))}
            />
          </div>
 </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={submitting} className="btn-glow">
              {submitting ? "Đang lưu..." : "Lưu điều khoản"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TermsForm;

