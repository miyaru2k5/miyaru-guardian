"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import FacebookContactCard, { FacebookContact } from "./FacebookContactCard";
import FacebookContactForm from "./FacebookContactForm";
import SearchBar from "@/components/SearchBar";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import { Button } from "@/components/ui/button";
import { Plus, MessageCircle, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const FacebookContactList: React.FC = () => {
  const [contacts, setContacts] = useState<FacebookContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<FacebookContact | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  /* ── Fetch ── */
  const fetchContacts = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("facebook_contacts")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) setError(error.message);
    else setContacts((data as FacebookContact[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchContacts(); }, []);

  /* ── Search ── */
  const handleSearchChange = useCallback((value: string) => setSearch(value), []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((c) =>
      c.title.toLowerCase().includes(q) ||
      c.branch_name.toLowerCase().includes(q),
    );
  }, [contacts, search]);

  /* ── CRUD ── */
  const handleCreateOrUpdate = async (values: any) => {
    if (editing) {
      const { error } = await supabase
        .from("facebook_contacts")
        .update(values)
        .eq("id", editing.id);
      if (error) throw error;
      toast({ title: "Đã cập nhật liên hệ" });
    } else {
      const { error } = await supabase.from("facebook_contacts").insert([values]);
      if (error) throw error;
      toast({ title: "Đã thêm liên hệ mới" });
    }
    await fetchContacts();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("facebook_contacts").delete().eq("id", deleteId);
    if (error) {
      toast({ title: "Lỗi xóa", description: error.message, variant: "destructive" });
      setDeleteId(null);
      return;
    }
    setContacts((prev) => prev.filter((c) => c.id !== deleteId));
    setDeleteId(null);
    toast({ title: "Đã xóa liên hệ" });
  };

  const handleToggleActive = async (contact: FacebookContact) => {
    const { error } = await supabase
      .from("facebook_contacts")
      .update({ is_active: !contact.is_active })
      .eq("id", contact.id);
    if (error) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
      return;
    }
    setContacts((prev) =>
      prev.map((c) => (c.id === contact.id ? { ...c, is_active: !c.is_active } : c)),
    );
  };

  const openAdd = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (contact: FacebookContact) => { setEditing(contact); setFormOpen(true); };

  /* ── Stats ── */
  const activeCount = contacts.filter((c) => c.is_active).length;

  /* ─── Render ─────────────────────────────────────────────── */
  return (
    <div className="space-y-6 min-w-0 overflow-x-hidden">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MessageCircle size={22} className="text-primary" />
            Liên hệ mạng xã hội
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5 flex items-center gap-1.5">
            <Users size={13} />
            {contacts.length} liên hệ
            <span className="text-muted-foreground/50">·</span>
            <span className="text-emerald-400">{activeCount} đang hiện</span>
          </p>
        </div>

        <Button onClick={openAdd} className="btn-glow gap-2 shrink-0">
          <Plus size={15} /> Thêm liên hệ
        </Button>
      </div>

      {/* Search */}
      <SearchBar
        onSearchChange={handleSearchChange}
        placeholder="Tìm theo tiêu đề, chi nhánh..."
      />

      {/* Error */}
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {/* Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 rounded-2xl bg-card border border-border animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
          <MessageCircle size={36} className="opacity-25" />
          <p className="text-sm">
            {search ? "Không tìm thấy kết quả phù hợp." : "Chưa có liên hệ nào. Hãy thêm mới!"}
          </p>
        </div>
      )}

      {/* Grid — 3 cols PC / 2 cols tablet / 1 col mobile */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-w-0">
          {filtered.map((contact) => (
            <FacebookContactCard
              key={contact.id}
              contact={contact}
              onEdit={() => openEdit(contact)}
              onDelete={() => setDeleteId(contact.id)}
              onToggleActive={() => handleToggleActive(contact)}
            />
          ))}
        </div>
      )}

      {/* Form dialog */}
      <FacebookContactForm
        open={formOpen}
        initial={editing ?? undefined}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreateOrUpdate}
      />

      {/* Confirm delete */}
      <ConfirmDeleteDialog
        open={!!deleteId}
        title="Xác nhận xóa liên hệ"
        description="Hành động này không thể hoàn tác. Bạn có chắc muốn xóa liên hệ này không?"
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default FacebookContactList;