"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus, Edit, Trash2, Mail, User as UserIcon,
  ImageIcon, Upload, X, Loader2,
} from "lucide-react";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import SearchBar from "@/components/SearchBar";
import FilterDropdown, { type FilterOption } from "@/components/FilterDropdown";
import type { Database } from "@/types/supabase";

/* ─── Types ──────────────────────────────────────────────── */
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type AppRole = Database["public"]["Enums"]["app_role"];
interface UserWithRole extends ProfileRow { role: AppRole }

/* ─── Schemas ────────────────────────────────────────────── */
const profileSchema = z.object({
  full_name: z.string().min(1, "Bắt buộc").max(100),
  email: z.string().email("Email không hợp lệ"),
  avatar_url: z.string().max(500).optional(),
  role: z.enum(["admin", "user"]),
});
type ProfileForm = z.infer<typeof profileSchema>;

const addUserSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu ít nhất 6 ký tự"),
  full_name: z.string().min(1, "Bắt buộc").max(100),
  avatar_url: z.string().max(500).optional(),
  role: z.enum(["admin", "user"]),
});
type AddForm = z.infer<typeof addUserSchema>;

/* ─── Avatar Upload Hook ─────────────────────────────────── */
function useAvatarUpload(setValue: (key: any, val: string) => void, fieldName: string) {
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
      setValue(fieldName, data.url);
      toast({ title: "Upload ảnh thành công" });
    } catch (err: any) {
      toast({ title: "Upload lỗi", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    upload(e.target.files[0]);
  };

  return { uploading, inputRef, handleChange };
}

/* ─── Avatar Preview Field ───────────────────────────────── */
interface AvatarFieldProps {
  label: string;
  registerProps: any;
  currentUrl: string | undefined;
  onClear: () => void;
  uploading: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

const AvatarField = ({
  label, registerProps, currentUrl, onClear,
  uploading, inputRef, onFileChange, error,
}: AvatarFieldProps) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
      <ImageIcon size={13} className="text-muted-foreground" />
      {label}
    </label>

    {/* URL Input */}
    <div className="relative">
      <Input
        {...registerProps}
        placeholder="https://... hoặc upload ảnh bên dưới"
      />
      {currentUrl && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-destructive transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>

    {/* Upload Button */}
    <label className={`
      inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border
      bg-muted hover:bg-muted/70 transition-colors cursor-pointer text-xs text-muted-foreground
      ${uploading ? "opacity-60 pointer-events-none" : ""}
    `}>
      {uploading
        ? <><Loader2 size={13} className="animate-spin" /> Đang upload...</>
        : <><Upload size={13} /> Tải ảnh lên từ máy</>
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
    {currentUrl && (
      <div className="flex items-center gap-3 mt-1 p-2 rounded-xl bg-muted/40 border border-border">
        <img
          src={currentUrl}
          alt="Avatar preview"
          className="w-12 h-12 rounded-full object-cover border-2 border-border"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <div className="min-w-0">
          <p className="text-xs font-medium text-foreground">Xem trước avatar</p>
          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{currentUrl}</p>
        </div>
      </div>
    )}

    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
);

/* ─── Main Component ─────────────────────────────────────── */
const Users = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [editUser, setEditUser] = useState<UserWithRole | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserWithRole | null>(null);

  /* Edit form */
  const {
    register, handleSubmit, reset, setValue, watch,
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { role: "user" },
  });
  const editAvatarUrl = watch("avatar_url");
  const editUpload = useAvatarUpload(setValue, "avatar_url");

  /* Add form */
  const addForm = useForm<AddForm>({
    resolver: zodResolver(addUserSchema),
    defaultValues: { role: "user" },
  });
  const addAvatarUrl = addForm.watch("avatar_url");
  const addUpload = useAvatarUpload(addForm.setValue, "avatar_url");

  /* ── Fetch ── */
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
    setUsers(profiles.map((p) => ({ ...p, role: roleMap.get(p.id) || "user" })));
  };

  useEffect(() => { fetchAll(); }, []);

  /* ── Edit submit ── */
  const onSubmit = async (data: ProfileForm) => {
    if (!editUser) return;
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ full_name: data.full_name, email: data.email, avatar_url: data.avatar_url || null })
      .eq("id", editUser.id);

    if (profileError) {
      toast({ title: "Lỗi", description: profileError.message, variant: "destructive" });
      return;
    }

    const { data: existingRow } = await supabase
      .from("user_roles").select("id").eq("user_id", editUser.id).maybeSingle();

    if (existingRow) {
      await supabase.from("user_roles").update({ role: data.role }).eq("id", existingRow.id);
    } else {
      await supabase.from("user_roles").insert([{ user_id: editUser.id, role: data.role }]);
    }

    toast({ title: "Đã cập nhật user" });
    setDialogOpen(false);
    setEditUser(null);
    reset();
    fetchAll();
  };

  /* ── Add via Edge Function ── */
  const addUserViaEdgeFunction = async (data: AddForm) => {
    setAddLoading(true);
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl) throw new Error("Thiếu NEXT_PUBLIC_SUPABASE_URL");

      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${supabaseUrl}/functions/v1/create-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          full_name: data.full_name,
          avatar_url: data.avatar_url || null,
          role: data.role,
        }),
      });

      const text = await res.text();
      let json: { message?: string; error?: string } = {};
      try { json = JSON.parse(text); } catch { json = { message: text }; }

      if (!res.ok) throw new Error(json.message || json.error || "Không thể tạo user");

      toast({ title: "Đã tạo user", description: "User có thể đăng nhập ngay." });
      setAddDialogOpen(false);
      addForm.reset();
      fetchAll();
    } catch (e: any) {
      toast({ title: "Lỗi", description: e?.message, variant: "destructive" });
    } finally {
      setAddLoading(false);
    }
  };

  /* ── Delete ── */
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

  /* ── Open edit dialog ── */
  const openEdit = (u: UserWithRole) => {
    setEditUser(u);
    reset({ full_name: u.full_name, email: u.email, avatar_url: u.avatar_url || "", role: u.role });
    setDialogOpen(true);
  };

  /* ── Filter ── */
  const handleSearchChange = useCallback((v: string) => setSearch(v), []);
  const handleFilterChange = useCallback((v: string) => setFilterRole(v), []);

  const filterOptions: FilterOption[] = useMemo(() => [
    { value: "all", label: "Tất cả vai trò" },
    { value: "admin", label: "Admin" },
    { value: "user", label: "User" },
  ], []);

  const filtered = useMemo(() =>
    users.filter((u) => {
      const q = search.toLowerCase();
      const matchSearch =
        u.email.toLowerCase().includes(q) ||
        (u.full_name || "").toLowerCase().includes(q);
      return matchSearch && (filterRole === "all" || u.role === filterRole);
    }),
    [users, search, filterRole],
  );

  /* ─── Render ──────────────────────────────────────────── */
  return (
    <div className="space-y-6 min-w-0 overflow-x-hidden">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý User</h1>
          <p className="text-muted-foreground text-sm">Xem, sửa, xóa và thêm user</p>
        </div>
        <Button
          onClick={() => {
            addForm.reset({ email: "", password: "", full_name: "", avatar_url: "", role: "user" });
            setAddDialogOpen(true);
          }}
          className="btn-glow gap-2"
        >
          <Plus size={16} /> Thêm user
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="flex-1">
          <SearchBar onSearchChange={handleSearchChange} placeholder="Tìm theo email, họ tên..." />
        </div>
        <div className="w-full md:w-auto shrink-0">
          <FilterDropdown options={filterOptions} value={filterRole} onChange={handleFilterChange} />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-w-0">
        {filtered.map((u) => (
          <div
            key={u.id}
            className="glow-border rounded-2xl p-5 card-hover min-w-0 overflow-hidden bg-card border border-border"
          >
            <div className="flex items-start justify-between gap-3 mb-4 min-w-0">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {u.avatar_url ? (
                  <img
                    src={u.avatar_url}
                    alt={u.full_name || "avatar"}
                    className="w-11 h-11 rounded-full object-cover border-2 border-border shrink-0"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                    <span className="text-base font-bold text-primary">
                      {(u.full_name || u.email || "U").charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground truncate text-sm">{u.full_name || "—"}</h3>
                  <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                    <Mail size={10} />{u.email}
                  </p>
                </div>
              </div>

              <span className={`
                shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold
                ${u.role === "admin"
                  ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                  : "bg-muted text-muted-foreground ring-1 ring-border"
                }
              `}>
                {u.role === "admin" ? "Admin" : "User"}
              </span>
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => openEdit(u)} className="flex-1 gap-1.5 text-xs h-8">
                <Edit size={13} /> Sửa
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDeleteTarget(u)}
                className="text-destructive hover:bg-destructive/10 hover:border-destructive/50 h-8 px-3"
              >
                <Trash2 size={13} />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
          <UserIcon size={36} className="opacity-25" />
          <p className="text-sm">Không tìm thấy user nào.</p>
        </div>
      )}

      {/* ── Edit Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) { setDialogOpen(false); setEditUser(null); } }}>
        <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
            <DialogTitle className="text-lg font-bold">Chỉnh sửa user</DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[65vh]">
            <form id="edit-user-form" onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-5">

              {/* Họ tên */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <UserIcon size={13} className="text-muted-foreground" /> Họ tên
                </label>
                <Input {...register("full_name")} placeholder="Họ tên đầy đủ" className={errors.full_name ? "border-destructive" : ""} />
                {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Mail size={13} className="text-muted-foreground" /> Email
                </label>
                <Input {...register("email")} placeholder="email@example.com" className={errors.email ? "border-destructive" : ""} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>

              {/* Avatar */}
              <AvatarField
                label="Ảnh đại diện"
                registerProps={register("avatar_url")}
                currentUrl={editAvatarUrl}
                onClear={() => setValue("avatar_url", "")}
                uploading={editUpload.uploading}
                inputRef={editUpload.inputRef}
                onFileChange={editUpload.handleChange}
                error={errors.avatar_url?.message}
              />

              {/* Vai trò */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground block">Vai trò</label>
                <select
                  {...register("role")}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

            </form>
          </ScrollArea>

          <div className="px-6 py-4 border-t border-border flex gap-2 bg-card">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              type="submit"
              form="edit-user-form"
              className="flex-1 btn-glow"
              disabled={isSubmitting || editUpload.uploading}
            >
              {isSubmitting ? <><Loader2 size={14} className="animate-spin mr-1" /> Đang lưu...</> : "Cập nhật"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Add Dialog ── */}
      <Dialog open={addDialogOpen} onOpenChange={(open) => { if (!open) setAddDialogOpen(false); }}>
        <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
            <DialogTitle className="text-lg font-bold">Thêm user mới</DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[65vh]">
            <form id="add-user-form" onSubmit={addForm.handleSubmit(addUserViaEdgeFunction)} className="px-6 py-5 space-y-5">

              <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 border border-border">
                User được tạo từ đây sẽ tự động xác minh email và có thể đăng nhập ngay.
              </p>

              {/* Họ tên */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Họ tên</label>
                <Input {...addForm.register("full_name")} placeholder="Họ tên đầy đủ" />
                {addForm.formState.errors.full_name && (
                  <p className="text-xs text-destructive">{addForm.formState.errors.full_name.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input {...addForm.register("email")} type="email" placeholder="email@example.com" />
                {addForm.formState.errors.email && (
                  <p className="text-xs text-destructive">{addForm.formState.errors.email.message}</p>
                )}
              </div>

              {/* Mật khẩu */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Mật khẩu</label>
                <Input {...addForm.register("password")} type="password" placeholder="Ít nhất 6 ký tự" />
                {addForm.formState.errors.password && (
                  <p className="text-xs text-destructive">{addForm.formState.errors.password.message}</p>
                )}
              </div>

              {/* Avatar */}
              <AvatarField
                label="Ảnh đại diện"
                registerProps={addForm.register("avatar_url")}
                currentUrl={addAvatarUrl}
                onClear={() => addForm.setValue("avatar_url", "")}
                uploading={addUpload.uploading}
                inputRef={addUpload.inputRef}
                onFileChange={addUpload.handleChange}
                error={addForm.formState.errors.avatar_url?.message}
              />

              {/* Vai trò */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground block">Vai trò</label>
                <select
                  {...addForm.register("role")}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

            </form>
          </ScrollArea>

          <div className="px-6 py-4 border-t border-border flex gap-2 bg-card">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setAddDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              type="submit"
              form="add-user-form"
              className="flex-1 btn-glow"
              disabled={addLoading || addUpload.uploading}
            >
              {addLoading
                ? <><Loader2 size={14} className="animate-spin mr-1" /> Đang tạo...</>
                : "Tạo user"
              }
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete */}
      <ConfirmDeleteDialog
        open={!!deleteTarget}
        title="Xác nhận xóa user"
        description={
          deleteTarget
            ? `Xóa user "${deleteTarget.full_name || deleteTarget.email}"? Hành động này không thể hoàn tác.`
            : ""
        }
        onClose={() => setDeleteTarget(null)}
        onConfirm={deleteUser}
      />
    </div>
  );
};

export default Users;