import React, { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import FacebookContactCard, { FacebookContact } from "./FacebookContactCard";
import FacebookContactForm from "./FacebookContactForm";
import SearchBar from "@/components/SearchBar";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";

const FacebookContactList: React.FC = () => {
  const [contacts, setContacts] = useState<FacebookContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<FacebookContact | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchContacts = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("facebook_contacts")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      setError(error.message);
    } else {
      setContacts((data as FacebookContact[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.branch_name.toLowerCase().includes(q),
    );
  }, [contacts, search]);

  const handleCreateOrUpdate = async (values: any) => {
    if (editing) {
      const { error } = await supabase
        .from("facebook_contacts")
        .update(values)
        .eq("id", editing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("facebook_contacts").insert([values]);
      if (error) throw error;
    }
    await fetchContacts();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("facebook_contacts").delete().eq("id", deleteId);
    if (error) {
      alert(error.message);
      setDeleteId(null);
      return;
    }
    setContacts(prev => prev.filter(c => c.id !== deleteId));
    setDeleteId(null);
  };

  const handleToggleActive = async (contact: FacebookContact) => {
    const { error } = await supabase
      .from("facebook_contacts")
      .update({ is_active: !contact.is_active })
      .eq("id", contact.id);
    if (error) {
      alert(error.message);
      return;
    }
    setContacts(prev =>
      prev.map(c =>
        c.id === contact.id ? { ...c, is_active: !c.is_active } : c,
      ),
    );
  };

  return (
    <div className="space-y-6 min-w-0 overflow-x-hidden">
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
        <div className="flex-1 w-full">
          <SearchBar
            onSearchChange={handleSearchChange}
            placeholder="Tìm kiếm liên hệ Facebook..."
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
            + Thêm liên hệ
          </button>
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-2xl bg-card border border-border animate-pulse"
            />
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/40 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {!loading && !error && filtered.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Chưa có liên hệ nào. Hãy bấm &quot;Thêm liên hệ&quot;.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
        {filtered.map(contact => (
          <FacebookContactCard
            key={contact.id}
            contact={contact}
            onEdit={() => {
              setEditing(contact);
              setFormOpen(true);
            }}
            onDelete={() => setDeleteId(contact.id)}
            onToggleActive={() => handleToggleActive(contact)}
          />
        ))}
      </div>

      <FacebookContactForm
        open={formOpen}
        initial={editing || undefined}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreateOrUpdate}
      />

      <ConfirmDeleteDialog
        open={!!deleteId}
        title="Xác nhận xóa liên hệ"
        description="Bạn có chắc chắn muốn xóa liên hệ này?"
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default FacebookContactList;

