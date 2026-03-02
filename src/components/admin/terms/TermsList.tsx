import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import TermsForm from "./TermsForm";
import type { TermsPage } from "@/types/terms";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";

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
        t.slug.toLowerCase().includes(q),
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
      const { error } = await supabase.from("terms_pages").insert([values]);
      if (error) throw error;
    }
    await fetchTerms();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("terms_pages").delete().eq("id", deleteId);
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
        t.id === term.id ? { ...t, is_published: !t.is_published } : t,
      ),
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
        <div className="flex-1 w-full">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm kiếm điều khoản..."
            className="w-full rounded-full bg-card border border-border px-4 py-2.5 text-sm text-foreground outline-none focus:border-pink-500"
          />
        </div>
        <div className="w-full md:w-auto shrink-0">
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="w-full md:w-auto px-4 py-2.5 rounded-2xl text-sm font-medium text-white
                       bg-gradient-to-r from-pink-500 to-rose-500
                       hover:scale-[1.03] hover:shadow-[0_0_24px_rgba(244,63,94,0.5)]
                       active:scale-100 transition-transform transition-shadow"
          >
            + Thêm điều khoản
          </button>
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl border border-border bg-card h-32 animate-pulse" />
      )}

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/40 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto rounded-2xl border border-border bg-background/60">
          <table className="min-w-full text-sm text-foreground">
            <thead className="bg-background/70">
              <tr>
                <th className="px-4 py-2 text-left">Tiêu đề</th>
                <th className="px-4 py-2 text-left">Slug</th>
                <th className="px-4 py-2 text-left">Thứ tự</th>
                <th className="px-4 py-2 text-center">Trạng thái</th>
                <th className="px-4 py-2 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(term => (
                <tr
                  key={term.id}
                  className="border-t border-border hover:bg-card/80"
                >
                  <td className="px-4 py-2">{term.title}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">
                    /dieu-khoan/{term.slug}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {term.display_order}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => togglePublish(term)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                        term.is_published
                          ? "border-emerald-400 text-emerald-300 bg-emerald-500/10"
                          : "border-muted text-muted-foreground bg-background/60"
                      }`}
                    >
                      {term.is_published ? "Đang publish" : "Nháp"}
                    </button>
                  </td>
                  <td className="px-4 py-2 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(term);
                        setFormOpen(true);
                      }}
                      className="px-3 py-1 rounded-xl border border-border text-xs hover:bg-card/70"
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteId(term.id)}
                      className="px-3 py-1 rounded-xl border border-destructive/50 text-xs text-destructive hover:bg-destructive/10"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-muted-foreground"
                  >
                    Không có điều khoản nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <TermsForm
        open={formOpen}
        initial={editing || undefined}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreateOrUpdate}
      />

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

