"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2, Mail, User as UserIcon, ImageIcon } from "lucide-react";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import SearchBar from "@/components/SearchBar";
import FilterDropdown, { type FilterOption } from "@/components/FilterDropdown";
import type { Database } from "@/types/supabase";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type AppRole = Database["public"]["Enums"]["app_role"];

interface UserWithRole extends ProfileRow {
  role: AppRole;
}

const profileSchema = z.object({
  full_name: z.string().min(1, "Bắt buộc").max(100),
  email: z.string().email("Email không hợp lệ"),
  avatar_url: z.string().max(500).optional(),
  role: z.enum(["admin", "user"]),
});

type ProfileForm = z.infer<typeof profileSchema>;

const Users = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [editUser, setEditUser] = useState<UserWithRole | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserWithRole | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { role: "user" },
  });

  const fetchAll = async () => {
    const [pRes, rRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    const profiles = (pRes.data || []) as ProfileRow[];
    const roleMap = new Map<string, AppRole>();
    ((rRes.data || []) as { user_id: string; role: AppRole }[]).forEach((r) => {
      if (!roleMap.has(r.user_id)) roleMap.set(r.user_id, r.role);
    });
    const merged: UserWithRole[] = profiles.map((p) => ({
      ...p,
      role: roleMap.get(p.id) || "user",
    }));
    setUsers(merged);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const onSubmit = async (data: ProfileForm) => {
    if (!editUser) return;
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: data.full_name,
        email: data.email,
        avatar_url: data.avatar_url || null,
      })
      .eq("id", editUser.id);
    if (profileError) {
      toast({ title: "Lỗi", description: profileError.message, variant: "destructive" });
      return;
    }
    const { data: existingRow } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", editUser.id)
      .maybeSingle();
    if (existingRow) {
      await supabase.from("user_roles").update({ role: data.role }).eq("id", existingRow.id);
    } else {
      await supabase.from("user_roles").insert([{ user_id: editUser.id, role: data.role }]);
    }
    toast({ title: "Đã cập nhật user" });
    setDialogOpen(false);
    setEditUser(null);
    fetchAll();
  };

  const deleteUser = async () => {
    if (!deleteTarget) return;
    await supabase.from("user_roles").delete().eq("user_id", deleteTarget.id);
    const { error } = await supabase.from("profiles").delete().eq("id", deleteTarget.id);
    if (error) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Đã xóa user" });
    setDeleteTarget(null);
    fetchAll();
  };

  const openEdit = (u: UserWithRole) => {
    setEditUser(u);
    reset({
      full_name: u.full_name,
      email: u.email,
      avatar_url: u.avatar_url || "",
      role: u.role,
    });
    setDialogOpen(true);
  };

  const handleSearchChange = useCallback((value: string) => setSearch(value), []);
  const handleFilterChange = useCallback((value: string) => setFilterRole(value), []);

  const filterOptions: FilterOption[] = useMemo(
    () => [
      { value: "all", label: "Tất cả vai trò" },
      { value: "admin", label: "Admin" },
      { value: "user", label: "User" },
    ],
    [],
  );

  const filtered = useMemo(
    () =>
      users.filter((u) => {
        const q = search.toLowerCase();
        const matchSearch =
          u.email.toLowerCase().includes(q) ||
          (u.full_name || "").toLowerCase().includes(q);
        const matchRole = filterRole === "all" || u.role === filterRole;
        return matchSearch && matchRole;
      }),
    [users, search, filterRole],
  );

  const addUserSchema = z.object({
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu ít nhất 6 ký tự"),
    full_name: z.string().min(1, "Bắt buộc").max(100),
    role: z.enum(["admin", "user"]),
  });
  type AddForm = z.infer<typeof addUserSchema>;
  const addForm = useForm<AddForm>({
    resolver: zodResolver(addUserSchema),
    defaultValues: { role: "user" },
  });

  const addUserViaEdgeFunction = async (data: AddForm) => {
    setAddLoading(true);
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl) {
        toast({ title: "Lỗi", description: "Thiếu VITE_SUPABASE_URL", variant: "destructive" });
        setAddLoading(false);
        return;
      }
      const fnUrl = `${supabaseUrl}/functions/v1/create-user`;
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch(fnUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          full_name: data.full_name,
          role: data.role,
        }),
      });
      const text = await res.text();
      let json: { message?: string; error?: string } = {};
      try {
        json = JSON.parse(text);
      } catch {
        json = { message: text || "Lỗi không xác định" };
      }
      if (!res.ok) {
        toast({ title: "Lỗi", description: json.message || json.error || "Không thể tạo user", variant: "destructive" });
        setAddLoading(false);
        return;
      }
      toast({ title: "Đã tạo user", description: "User có thể đăng nhập bằng email/mật khẩu." });
      setAddDialogOpen(false);
      addForm.reset();
      fetchAll();
    } catch (e: any) {
      toast({
        title: "Lỗi",
        description: e?.message || "Triển khai Edge Function create-user (supabase functions deploy create-user) để thêm user từ admin.",
        variant: "destructive",
      });
    }
    setAddLoading(false);
  };

  return (
    <div className="space-y-6 min-w-0 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý User</h1>
          <p className="text-muted-foreground text-sm">Xem, sửa, xóa và thêm user</p>
        </div>
        <Button onClick={() => { addForm.reset({ email: "", password: "", full_name: "", role: "user" }); setAddDialogOpen(true); }} className="btn-glow gap-2">
          <Plus size={16} /> Thêm user
        </Button>
      </div>

      <div className="mb-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          <div className="flex-1 w-full">
            <SearchBar
              onSearchChange={handleSearchChange}
              placeholder="Tìm theo email, họ tên..."
            />
          </div>
          <div className="w-full md:w-auto shrink-0">
            <FilterDropdown
              options={filterOptions}
              value={filterRole}
              onChange={handleFilterChange}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-w-0">
        {filtered.map((u) => (
          <div key={u.id} className="glow-border rounded-2xl p-5 card-hover min-w-0 overflow-hidden">
            <div className="flex items-start justify-between gap-3 mb-3 min-w-0">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {u.avatar_url ? (
                  <img src={u.avatar_url} alt={u.full_name} className="w-12 h-12 rounded-full object-cover border border-primary/20" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/20">
                    <span className="text-lg font-bold text-primary">{(u.full_name || u.email || "U").charAt(0)}</span>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground truncate">{u.full_name || "—"}</h3>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                </div>
              </div>
              <span
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium ${
                  u.role === "admin" ? "bg-primary/20 text-primary border border-primary/40" : "bg-secondary/80 text-muted-foreground"
                }`}
              >
                {u.role === "admin" ? "Admin" : "User"}
              </span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => openEdit(u)} className="flex-1 gap-1">
                <Edit size={14} /> Sửa
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => setDeleteTarget(u)}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-8">Không có user nào.</p>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sửa user</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 flex items-center gap-1"><UserIcon size={14} /> Họ tên</label>
              <Input {...register("full_name")} placeholder="Họ tên" />
              {errors.full_name && <p className="text-xs text-destructive mt-1">{errors.full_name.message}</p>}
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 flex items-center gap-1"><Mail size={14} /> Email</label>
              <Input {...register("email")} placeholder="email@example.com" />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 flex items-center gap-1"><ImageIcon size={14} /> Avatar URL</label>
              <Input {...register("avatar_url")} placeholder="https://..." />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Vai trò</label>
              <select
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                {...register("role")}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <Button type="submit" className="w-full btn-glow">Cập nhật</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Thêm user</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground mb-4">
            User được tạo từ đây sẽ tự động xác minh email và có thể đăng nhập ngay.
          </p>
          <form onSubmit={addForm.handleSubmit(addUserViaEdgeFunction)} className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Họ tên</label>
              <Input {...addForm.register("full_name")} placeholder="Họ tên" />
              {addForm.formState.errors.full_name && (
                <p className="text-xs text-destructive mt-1">{addForm.formState.errors.full_name.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Email</label>
              <Input {...addForm.register("email")} type="email" placeholder="email@example.com" />
              {addForm.formState.errors.email && (
                <p className="text-xs text-destructive mt-1">{addForm.formState.errors.email.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Mật khẩu</label>
              <Input {...addForm.register("password")} type="password" placeholder="Ít nhất 6 ký tự" />
              {addForm.formState.errors.password && (
                <p className="text-xs text-destructive mt-1">{addForm.formState.errors.password.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Vai trò</label>
              <select
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                {...addForm.register("role")}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <Button type="submit" className="w-full btn-glow" disabled={addLoading}>
              {addLoading ? "Đang tạo..." : "Tạo user"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        title="Xác nhận xóa user"
        description={deleteTarget ? `Xóa user "${deleteTarget.full_name}" (${deleteTarget.email})? Họ sẽ không còn profile và vai trò.` : ""}
        onClose={() => setDeleteTarget(null)}
        onConfirm={deleteUser}
      />
    </div>
  );
};

export default Users;
