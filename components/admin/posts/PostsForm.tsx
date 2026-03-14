"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Post } from "@/types/posts";
import { Plus, Trash2 } from "lucide-react";

export type PostSectionFormValues = {
  id?: string;
  title: string;
  content: string;
  image_url: string;
  alt_text: string;
  caption: string;
};

export type PostFormValues = {
  slug: string;
  title: string;
  excerpt: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  og_title: string;
  og_description: string;
  og_image: string;
  cover_image: string;
  author_name: string;
  author_avatar: string;
  category: string;
  tags: string;
  reading_time: string;
  published: boolean;
  sections: PostSectionFormValues[];
};

interface PostsFormProps {
  open: boolean;
  initial?: Post;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: PostFormValues) => Promise<void>;
}

const createEmptyValues = (): PostFormValues => ({
  slug: "",
  title: "",
  excerpt: "",
  meta_title: "",
  meta_description: "",
  meta_keywords: "",
  og_title: "",
  og_description: "",
  og_image: "",
  cover_image: "",
  author_name: "",
  author_avatar: "",
  category: "",
  tags: "",
  reading_time: "",
  published: true,
  sections: [],
});

const PostsForm = ({ open, initial, loading = false, onClose, onSubmit }: PostsFormProps) => {
  const [values, setValues] = useState<PostFormValues>(() => createEmptyValues());
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setValues(createEmptyValues());
      setFormError(null);
      return;
    }

    const sections = (initial?.post_images ?? [])
      .slice()
      .sort((a, b) => (a.image_order ?? 0) - (b.image_order ?? 0))
      .map((section) => ({
        id: section.id,
        title: section.title ?? "",
        content: section.content ?? "",
        image_url: section.image_url,
        alt_text: section.alt_text ?? "",
        caption: section.caption ?? "",
      }));

    setValues({
      slug: initial?.slug ?? "",
      title: initial?.title ?? "",
      excerpt: initial?.excerpt ?? "",
      meta_title: initial?.meta_title ?? "",
      meta_description: initial?.meta_description ?? "",
      meta_keywords: initial?.meta_keywords ?? "",
      og_title: initial?.og_title ?? "",
      og_description: initial?.og_description ?? "",
      og_image: initial?.og_image ?? "",
      cover_image: initial?.cover_image ?? "",
      author_name: initial?.author_name ?? "",
      author_avatar: initial?.author_avatar ?? "",
      category: initial?.category ?? "",
      tags: (initial?.tags ?? []).filter(Boolean).join(", "),
      reading_time: initial?.reading_time != null ? String(initial.reading_time) : "",
      published: initial?.published ?? true,
      sections,
    });
  }, [initial, open]);

  const handleInputChange = (field: keyof PostFormValues, value: string | boolean) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSectionChange = (
    index: number,
    field: keyof PostSectionFormValues,
    value: string,
  ) => {
    setValues((prev) => {
      const next = [...prev.sections];
      if (!next[index]) return prev;
      next[index] = { ...next[index], [field]: value };
      return { ...prev, sections: next };
    });
  };

  const handleAddSection = () => {
    setValues((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        { title: "", content: "", image_url: "", alt_text: "", caption: "" },
      ],
    }));
  };

  const handleRemoveSection = (index: number) => {
    setValues((prev) => {
      const next = [...prev.sections];
      next.splice(index, 1);
      return { ...prev, sections: next };
    });
  };

  const handleSubmit = async () => {
    setFormError(null);
    try {
      await onSubmit(values);
      onClose();
    } catch (error: any) {
      setFormError(error?.message ?? "Có lỗi xảy ra");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(visible) => !visible && onClose()}>
      {/* max-h + flex-col để phần nội dung có thể scroll độc lập */}
      <DialogContent className="flex max-h-[90vh] max-w-5xl flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>{initial ? "Cập nhật Tin tức" : "Tạo Tin tức mới"}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Điền thông tin Tin tức và các section nội dung hình ảnh. Mỗi section có thể hiển thị
            trong landing page.
          </DialogDescription>
        </DialogHeader>

        {/* Vùng scroll chính */}
        <div className="flex-1 overflow-y-auto pr-1">
          {formError && (
            <div className="mb-4 rounded-2xl border border-destructive/40 bg-destructive/5 px-4 py-2 text-sm text-destructive">
              {formError}
            </div>
          )}

          <div className="space-y-5 mt-2">
            {/* Slug & Tiêu đề */}
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-sm text-muted-foreground">
                <span>Slug</span>
                <input
                  type="text"
                  value={values.slug}
                  onChange={(e) => handleInputChange("slug", e.target.value)}
                  placeholder="vi-du-bai-viet"
                  className="w-full rounded-xl border border-border bg-card/80 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </label>
              <label className="space-y-1 text-sm text-muted-foreground">
                <span>Tiêu đề</span>
                <input
                  type="text"
                  value={values.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Tiêu đề Tin tức"
                  className="w-full rounded-xl border border-border bg-card/80 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </label>
            </div>

            {/* Excerpt */}
            <label className="space-y-1 text-sm text-muted-foreground">
              <span>Đoạn mô tả (excerpt)</span>
              <textarea
                value={values.excerpt}
                onChange={(e) => handleInputChange("excerpt", e.target.value)}
                rows={3}
                placeholder="Tóm tắt ngắn gọn về nội dung"
                className="w-full rounded-xl border border-border bg-card/80 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </label>

            {/* Ảnh cover & Thời gian đọc */}
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-sm text-muted-foreground">
                <span>Ảnh cover</span>
                <input
                  type="text"
                  value={values.cover_image}
                  onChange={(e) => handleInputChange("cover_image", e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-border bg-card/80 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </label>
              <label className="space-y-1 text-sm text-muted-foreground">
                <span>Thời gian đọc (phút)</span>
                <input
                  type="number"
                  min={0}
                  value={values.reading_time}
                  onChange={(e) => handleInputChange("reading_time", e.target.value)}
                  placeholder="5"
                  className="w-full rounded-xl border border-border bg-card/80 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </label>
            </div>

            {/* Danh mục & Tags */}
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-sm text-muted-foreground">
                <span>Danh mục</span>
                <input
                  type="text"
                  value={values.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  placeholder="Tin tức"
                  className="w-full rounded-xl border border-border bg-card/80 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </label>
              <label className="space-y-1 text-sm text-muted-foreground">
                <span>Tags (phân cách bằng dấu phẩy)</span>
                <input
                  type="text"
                  value={values.tags}
                  onChange={(e) => handleInputChange("tags", e.target.value)}
                  placeholder="miyaru, bảo vệ"
                  className="w-full rounded-xl border border-border bg-card/80 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </label>
            </div>

            {/* Trạng thái xuất bản */}
            <div className="flex items-center gap-3">
              <Switch
                checked={values.published}
                onCheckedChange={(state) => handleInputChange("published", Boolean(state))}
              />
              <span className="text-sm font-semibold text-foreground">
                {values.published ? "Đã xuất bản" : "Bản nháp"}
              </span>
            </div>

            {/* Tác giả */}
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-sm text-muted-foreground">
                <span>Tác giả</span>
                <input
                  type="text"
                  value={values.author_name}
                  onChange={(e) => handleInputChange("author_name", e.target.value)}
                  placeholder="Họ tên tác giả"
                  className="w-full rounded-xl border border-border bg-card/80 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </label>
              <label className="space-y-1 text-sm text-muted-foreground">
                <span>Ảnh đại diện tác giả</span>
                <input
                  type="text"
                  value={values.author_avatar}
                  onChange={(e) => handleInputChange("author_avatar", e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-border bg-card/80 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </label>
            </div>

            {/* SEO */}
            <div className="space-y-3 rounded-2xl border border-border bg-background/50 p-4">
              <p className="text-sm font-semibold text-foreground">Thông tin SEO</p>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-1 text-sm text-muted-foreground">
                  <span>Meta Title</span>
                  <input
                    type="text"
                    value={values.meta_title}
                    onChange={(e) => handleInputChange("meta_title", e.target.value)}
                    placeholder="Tiêu đề SEO"
                    className="w-full rounded-xl border border-border bg-card/80 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </label>
                <label className="space-y-1 text-sm text-muted-foreground">
                  <span>Meta Description</span>
                  <textarea
                    value={values.meta_description}
                    onChange={(e) => handleInputChange("meta_description", e.target.value)}
                    rows={2}
                    placeholder="Mô tả ngắn gọn để hiển thị trên SERP"
                    className="w-full rounded-xl border border-border bg-card/80 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </label>
              </div>
              <label className="space-y-1 text-sm text-muted-foreground">
                <span>Meta Keywords</span>
                <input
                  type="text"
                  value={values.meta_keywords}
                  onChange={(e) => handleInputChange("meta_keywords", e.target.value)}
                  placeholder="seo, bảo vệ"
                  className="w-full rounded-xl border border-border bg-card/80 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </label>
            </div>

            {/* Open Graph */}
            <div className="space-y-3 rounded-2xl border border-border bg-background/50 p-4">
              <p className="text-sm font-semibold text-foreground">Mạng xã hội / Open Graph</p>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-1 text-sm text-muted-foreground">
                  <span>OG Title</span>
                  <input
                    type="text"
                    value={values.og_title}
                    onChange={(e) => handleInputChange("og_title", e.target.value)}
                    placeholder="Tiêu đề hiển thị khi chia sẻ"
                    className="w-full rounded-xl border border-border bg-card/80 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </label>
                <label className="space-y-1 text-sm text-muted-foreground">
                  <span>OG Description</span>
                  <textarea
                    value={values.og_description}
                    onChange={(e) => handleInputChange("og_description", e.target.value)}
                    rows={2}
                    placeholder="Mô tả khi chia sẻ link"
                    className="w-full rounded-xl border border-border bg-card/80 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </label>
              </div>
              <label className="space-y-1 text-sm text-muted-foreground">
                <span>OG Image</span>
                <input
                  type="text"
                  value={values.og_image}
                  onChange={(e) => handleInputChange("og_image", e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-border bg-card/80 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </label>
            </div>

            {/* Sections */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Các section nội dung</p>
                <Button type="button" variant="outline" onClick={handleAddSection} className="h-9">
                  <Plus size={16} />
                  Thêm section
                </Button>
              </div>

              {values.sections.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Chưa có section nào. Thêm ít nhất một section để hiển thị nội dung.
                </p>
              )}

              <div className="space-y-4">
                {values.sections.map((section, index) => (
                  <div
                    key={`${section.id ?? `new-${index}`}-${index}`}
                    className="rounded-2xl border border-border bg-card/50 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">Section #{index + 1}</p>
                      <button
                        type="button"
                        onClick={() => handleRemoveSection(index)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-border text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="space-y-1 text-sm text-muted-foreground">
                        <span>Tiêu đề section</span>
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) => handleSectionChange(index, "title", e.target.value)}
                          placeholder="Mô tả / câu dẫn"
                          className="w-full rounded-xl border border-border bg-card/80 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                        />
                      </label>
                      <label className="space-y-1 text-sm text-muted-foreground">
                        <span>Ảnh / URL chính</span>
                        <input
                          type="text"
                          value={section.image_url}
                          onChange={(e) => handleSectionChange(index, "image_url", e.target.value)}
                          placeholder="https://..."
                          className="w-full rounded-xl border border-border bg-card/80 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                        />
                      </label>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="space-y-1 text-sm text-muted-foreground">
                        <span>Alt text</span>
                        <input
                          type="text"
                          value={section.alt_text}
                          onChange={(e) => handleSectionChange(index, "alt_text", e.target.value)}
                          placeholder="Mô tả ngắn cho ảnh"
                          className="w-full rounded-xl border border-border bg-card/80 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                        />
                      </label>
                      <label className="space-y-1 text-sm text-muted-foreground">
                        <span>Caption</span>
                        <input
                          type="text"
                          value={section.caption}
                          onChange={(e) => handleSectionChange(index, "caption", e.target.value)}
                          placeholder="Chú thích (nếu có)"
                          className="w-full rounded-xl border border-border bg-card/80 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                        />
                      </label>
                    </div>
                    <label className="space-y-1 text-sm text-muted-foreground">
                      <span>Nội dung chính (HTML hoặc định dạng văn bản)</span>
                      <textarea
                        value={section.content}
                        onChange={(e) => handleSectionChange(index, "content", e.target.value)}
                        rows={4}
                        placeholder="Viết hướng dẫn, đoạn văn..."
                        className="w-full rounded-xl border border-border bg-card/80 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer cố định ở dưới, không bị scroll */}
        <DialogFooter className="shrink-0 pt-4">
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Hủy
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={loading}>
              {loading ? "Đang lưu..." : initial ? "Cập nhật Tin tức" : "Tạo Tin tức"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { PostsForm };
export default PostsForm;