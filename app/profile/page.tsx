"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { getAuthErrorMessage } from "@/lib/authErrors";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Lock, ImageIcon, Upload, Save, KeyRound } from "lucide-react";
import MainLayout from "@/layouts/MainLayout";

const R2_DOMAIN = process.env.NEXT_PUBLIC_R2_DOMAIN!;
// → "pub-49d2fd12bb2f4f23a6d3196d2fcf2842.r2.dev"

const ProfilePage = () => {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [oldAvatarUrl, setOldAvatarUrl] = useState("");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [loading, setLoading] = useState(false);

  const [pwForm, setPwForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [pwLoading, setPwLoading] = useState(false);

  // ================= AUTH =================
  useEffect(() => {
    if (isLoading) return;
    if (!user) router.replace("/login");
  }, [user, isLoading, router]);

  // ================= LOAD PROFILE =================
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setFullName(data.full_name || "");
        setAvatarUrl(data.avatar_url || "");
        setOldAvatarUrl(data.avatar_url || "");
      }
    };

    fetchProfile();
  }, [user]);

  // ================= PREVIEW =================
  const handleFileChange = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // ================= UPLOAD =================
  const uploadToR2 = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    return data.url;
  };

  // ================= DELETE =================
  const deleteFromR2 = async (url: string) => {
    try {
      await fetch("/api/upload/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // ================= UPDATE PROFILE =================
  const updateProfile = async () => {
    if (!user) return;
    setLoading(true);

    try {
      let finalAvatar = avatarUrl;

      if (selectedFile) {
        const newUrl = await uploadToR2(selectedFile);
        finalAvatar = newUrl;

        // Xóa ảnh cũ nếu là ảnh R2
        if (oldAvatarUrl && oldAvatarUrl.includes(R2_DOMAIN)) {
          console.log("Deleting old avatar:", oldAvatarUrl);
          await deleteFromR2(oldAvatarUrl);
        }
      }

      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName, avatar_url: finalAvatar || null })
        .eq("id", user.id);

      if (error) throw error;

      setAvatarUrl(finalAvatar);
      setOldAvatarUrl(finalAvatar);
      setSelectedFile(null);
      setPreviewUrl("");

      toast({ title: "Đã cập nhật profile" });
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // ================= CHANGE PASSWORD =================
  const changePassword = async () => {
    if (pwForm.password.length < 6) {
      toast({ title: "Mật khẩu ít nhất 6 ký tự", variant: "destructive" });
      return;
    }
    if (pwForm.password !== pwForm.confirmPassword) {
      toast({ title: "Mật khẩu không khớp", variant: "destructive" });
      return;
    }

    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pwForm.password });
    setPwLoading(false);

    if (error) {
      toast({ title: "Lỗi", description: getAuthErrorMessage(error), variant: "destructive" });
      return;
    }

    toast({ title: "Đã đổi mật khẩu" });
    setPwForm({ password: "", confirmPassword: "" });
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="pt-24 pb-12 container max-w-4xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-6">

          {/* ===== PROFILE ===== */}
          <div className="p-6 rounded-2xl bg-card glow-border">

            {/* Avatar + Info */}
            <div className="flex items-center gap-4 mb-6">

              {/* Avatar với gradient border */}
              <div className="p-[3px] rounded-full bg-gradient-to-br from-primary to-primary/30 shrink-0">
                <div className="p-[2px] rounded-full bg-card">
                  {previewUrl ? (
                    <img src={previewUrl} className="w-20 h-20 rounded-full object-cover" />
                  ) : avatarUrl ? (
                    <img src={avatarUrl} className="w-20 h-20 rounded-full object-cover" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-xl font-bold">
                      {fullName?.charAt(0) || "U"}
                    </div>
                  )}
                </div>
              </div>

              <div>
                {/* Name + tick.gif */}
                <div className="flex items-center gap-1.5">
                  <p className="font-bold">{fullName || "User"}</p>
                  <img src="/tick.gif" alt="verified" className="w-4 h-4" />
                </div>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>

            </div>

            {/* Form */}
            <div className="space-y-4">

              {/* Họ tên */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  Họ và tên
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    className="pl-9"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nhập họ và tên..."
                  />
                </div>
              </div>

              {/* Avatar URL */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" />
                  Avatar URL
                </label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    className="pl-9"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.png"
                  />
                </div>
              </div>

              {/* Upload file */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  Tải ảnh lên
                </label>
                <div className="relative">
                  <Upload className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    className="pl-9"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              <Button onClick={updateProfile} disabled={loading} className="w-full gap-2">
                <Save className="w-4 h-4" />
                {loading ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>

            </div>
          </div>

          {/* ===== PASSWORD ===== */}
          <div className="p-6 rounded-2xl bg-card glow-border">

            <h3 className="font-bold mb-6 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-primary" />
              Đổi mật khẩu
            </h3>

            <div className="space-y-4">

              {/* Mật khẩu mới */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    className="pl-9"
                    type="password"
                    placeholder="Nhập mật khẩu mới..."
                    value={pwForm.password}
                    onChange={(e) =>
                      setPwForm((p) => ({ ...p, password: e.target.value }))
                    }
                  />
                </div>
              </div>

              {/* Xác nhận mật khẩu */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    className="pl-9"
                    type="password"
                    placeholder="Nhập lại mật khẩu..."
                    value={pwForm.confirmPassword}
                    onChange={(e) =>
                      setPwForm((p) => ({ ...p, confirmPassword: e.target.value }))
                    }
                  />
                </div>
              </div>

              <Button
                onClick={changePassword}
                disabled={pwLoading}
                variant="outline"
                className="w-full gap-2"
              >
                <KeyRound className="w-4 h-4" />
                {pwLoading ? "Đang cập nhật..." : "Đổi mật khẩu"}
              </Button>

            </div>
          </div>

        </div>

      </div>
    </MainLayout>
  );
};

export default ProfilePage;