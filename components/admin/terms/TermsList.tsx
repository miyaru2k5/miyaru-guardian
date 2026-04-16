"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import TermsForm from "./TermsForm";
import type { TermsPage } from "@/types/terms";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";

import {
  Plus,
  FileText,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Hash,
} from "lucide-react";

const TermsList: React.FC = () => {
  const [items, setItems] = useState<TermsPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<TermsPage | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchTerms = async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("terms_pages")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) setError(error.message);
    else setItems((data as TermsPage[]) || []);

    setLoading(false);
  };

  useEffect(() => {
    fetchTerms();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      t =>
        t.title.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q)
    );
  }, [items, search]);

  const handleCreateOrUpdate = async (values: any) => {
    if (editing) {
      const { error } = await supabase
        .from("terms_pages")
        .update(values)
        .eq("id", editing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("terms_pages")
        .insert([values]);
      if (error) throw error;
    }
    await fetchTerms();
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase
      .from("terms_pages")
      .delete()
      .eq("id", deleteId);

    if (error) {
      alert(error.message);
      setDeleteId(null);
      return;
    }

    setItems(prev => prev.filter(t => t.id !== deleteId));
    setDeleteId(null);
  };

  const togglePublish = async (term: TermsPage) => {
    const { error } = await supabase
      .from("terms_pages")
      .update({ is_published: !term.is_published })
      .eq("id", term.id);

    if (error) {
      alert(error.message);
      return;
    }

    setItems(prev =>
      prev.map(t =>
        t.id === term.id
          ? { ...t, is_published: !t.is_published }
          : t
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
        <div className="flex-1">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm kiếm điều khoản..."
            className="w-full rounded-full bg-card border border-border px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>

        <button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-medium text-white
                     bg-gradient-to-r from-pink-500 to-rose-500
                     hover:scale-[1.03] transition"
        >
          <Plus size={16} />
          Thêm điều khoản
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-2xl bg-card animate-pulse border border-border"
            />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/40 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {/* Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-10 text-muted-foreground">
              Không có điều khoản nào.
            </div>
          ) : (
            filtered.map((term, i) => (
              <div
                key={term.id}
                className={`
                  group relative rounded-2xl border border-border bg-card/60 backdrop-blur p-5
                  hover:border-primary/40 transition-all duration-300
                  hover:shadow-[0_0_30px_rgba(244,63,94,0.15)]
                  animate-fade-in-up
                  ${!term.is_published ? "opacity-60 grayscale" : ""}
                `}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {/* Glow */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 
                                bg-gradient-to-br from-pink-500/10 to-rose-500/10 transition" />

                <div className="relative z-10 space-y-4">
                  {/* Header */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <FileText size={18} className="text-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{term.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        /dieu-khoan/{term.slug}
                      </p>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Hash size={14} />
                    Thứ tự: <b>{term.display_order}</b>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-border/50">
                    {/* Toggle */}
                    <button
                      onClick={() => togglePublish(term)}
                      className={`
                        flex items-center gap-1.5 px-3 h-8 rounded-xl text-xs border transition
                        ${
                          term.is_published
                            ? "border-emerald-400 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
                            : "border-border text-muted-foreground hover:bg-muted/50"
                        }
                      `}
                    >
                      {term.is_published ? (
                        <>
                          <Eye size={13} /> Public
                        </>
                      ) : (
                        <>
                          <EyeOff size={13} /> Nháp
                        </>
                      )}
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => {
                        setEditing(term);
                        setFormOpen(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 h-8 rounded-xl border border-border text-xs hover:bg-card"
                    >
                      <Edit size={13} />
                      Sửa
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => setDeleteId(term.id)}
                      className="flex items-center justify-center px-3 h-8 rounded-xl border border-destructive/40 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Form */}
      <TermsForm
        open={formOpen}
        initial={editing || undefined}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreateOrUpdate}
      />

      {/* Confirm Delete */}
      <ConfirmDeleteDialog
        open={!!deleteId}
        title="Xác nhận xóa điều khoản"
        description="Bạn có chắc chắn muốn xóa điều khoản này?"
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default TermsList;