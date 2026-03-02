import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Tag, Edit, Check, X, Search } from "lucide-react";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";

interface Category {
  id: string;
  name: string;
  created_at: string;
}

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("*").order("created_at", { ascending: false });
    setCategories((data as Category[]) || []);
  };

  useEffect(() => { fetchCategories(); }, []);

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const addCategory = async () => {
    const name = newName.trim();
    if (!name) return;
    const { error } = await supabase.from("categories").insert([{ name }]);
    if (error) { toast({ title: "Lỗi", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Đã thêm danh mục" });
    setNewName("");
    fetchCategories();
  };

  const updateCategory = async (id: string) => {
    const name = editName.trim();
    if (!name) return;
    const { error } = await supabase.from("categories").update({ name }).eq("id", id);
    if (error) { toast({ title: "Lỗi", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Đã cập nhật" });
    setEditId(null);
    fetchCategories();
  };

  const deleteCategory = async () => {
    if (!deleteId) return;
    await supabase.from("trader_categories").delete().eq("category_id", deleteId);
    await supabase.from("categories").delete().eq("id", deleteId);
    toast({ title: "Đã xóa danh mục" });
    setDeleteId(null);
    fetchCategories();
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Danh mục dịch vụ</h1>
          <p className="text-muted-foreground text-sm">Quản lý danh mục cho giao dịch viên</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glow-border rounded-2xl p-6">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Plus size={18} className="text-primary" /> Thêm danh mục mới
            </h3>
            <div className="flex gap-3">
              <Input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Nhập tên danh mục"
                onKeyDown={e => e.key === "Enter" && addCategory()}
              />
              <Button onClick={addCategory} className="btn-glow shrink-0 gap-2">
                <Plus size={16} /> Thêm
              </Button>
            </div>
          </div>

          <div className="glow-border rounded-2xl p-6">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Tag size={18} className="text-primary" /> Danh sách ({filtered.length})
            </h3>

            {categories.length > 0 && (
              <div className="mb-4">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Tìm kiếm danh mục..."
                    className="pl-9"
                  />
                </div>
              </div>
            )}

            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                {categories.length === 0
                  ? "Chưa có danh mục nào"
                  : "Không tìm thấy danh mục phù hợp"}
              </p>
            ) : (
              <div className="space-y-2">
                {filtered.map(c => (
                  <div key={c.id} className="flex items-center gap-2 p-3 rounded-xl bg-secondary/50 border border-border">
                    {editId === c.id ? (
                      <>
                        <Input value={editName} onChange={e => setEditName(e.target.value)}
                          className="flex-1 h-8" autoFocus
                          onKeyDown={e => { if (e.key === "Enter") updateCategory(c.id); if (e.key === "Escape") setEditId(null); }} />
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => updateCategory(c.id)}>
                          <Check size={14} />
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => setEditId(null)}>
                          <X size={14} />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Tag size={14} className="text-primary shrink-0" />
                        <span className="flex-1 text-sm font-medium text-foreground">{c.name}</span>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => { setEditId(c.id); setEditName(c.name); }}>
                          <Edit size={14} />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => setDeleteId(c.id)}>
                          <Trash2 size={14} />
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDeleteDialog
        open={!!deleteId}
        title="Xác nhận xóa danh mục"
        description="Xóa danh mục này? Các GDV thuộc danh mục sẽ bị gỡ liên kết."
        onClose={() => setDeleteId(null)}
        onConfirm={deleteCategory}
      />
    </>
  );
};

export default Categories;
