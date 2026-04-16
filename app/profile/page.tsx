"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { getAuthErrorMessage } from "@/lib/authErrors";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  User,
  Lock,
  ImageIcon,
  Upload,
  Save,
  KeyRound,
  Palette,
  RotateCcw,
} from "lucide-react";
import MainLayout from "@/layouts/MainLayout";

import {
  useThemeCustomizer,
  hslToHex,
  hexToHsl,
} from "@/contexts/ThemeCustomizerContext";

const R2_DOMAIN = process.env.NEXT_PUBLIC_R2_DOMAIN!;

const ProfilePage = () => {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // ================= PROFILE =================
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [oldAvatarUrl, setOldAvatarUrl] = useState("");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [loading, setLoading] = useState(false);

  // ================= PASSWORD =================
  const [pwForm, setPwForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [pwLoading, setPwLoading] = useState(false);

  // ================= THEME =================
  const {
    allowUserTheme,
    currentMode,
    currentPrimaryColor,
    currentBackgroundColor,
    toggleMode,
    setUserPrimaryColor,
    setUserBackgroundColor,
    resetToSystemDefaults,
    forceDarkMode,
  } = useThemeCustomizer();

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

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    return data.url;
  };

  // ================= DELETE =================
  const deleteFromR2 = async (url: string) => {
    try {
      await fetch("/api/upload/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

        if (oldAvatarUrl && oldAvatarUrl.includes(R2_DOMAIN)) {
          await deleteFromR2(oldAvatarUrl);
        }
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          avatar_url: finalAvatar || null,
        })
        .eq("id", user.id);

      if (error) throw error;

      setAvatarUrl(finalAvatar);
      setOldAvatarUrl(finalAvatar);
      setSelectedFile(null);
      setPreviewUrl("");

      toast({ title: "Đã cập nhật profile" });
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: err.message,
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  // ================= CHANGE PASSWORD =================
  const changePassword = async () => {
    if (pwForm.password.length < 6) {
      toast({
        title: "Mật khẩu ít nhất 6 ký tự",
        variant: "destructive",
      });
      return;
    }

    if (pwForm.password !== pwForm.confirmPassword) {
      toast({
        title: "Mật khẩu không khớp",
        variant: "destructive",
      });
      return;
    }

    setPwLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: pwForm.password,
    });

    setPwLoading(false);

    if (error) {
      toast({
        title: "Lỗi",
        description: getAuthErrorMessage(error),
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Đã đổi mật khẩu" });

    setPwForm({
      password: "",
      confirmPassword: "",
    });
  };

  // ================= LOADING =================
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

        {/* GRID */}
        <div className="grid lg:grid-cols-2 gap-6">

          {/* ===== PROFILE ===== */}
          <div className="p-6 rounded-2xl bg-card glow-border">

            <div className="flex items-center gap-4 mb-6">
              <div className="p-[3px] rounded-full bg-gradient-to-br from-primary to-primary/30">
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
                <div className="flex items-center gap-1.5">
                  <p className="font-bold">{fullName || "User"}</p>
                  <img src="/tick.gif" className="w-4 h-4" />
                </div>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="space-y-4">

              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Họ tên" />

              <Input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="Avatar URL" />

              <Input type="file" accept="image/*" onChange={handleFileChange} />

              <Button onClick={updateProfile} disabled={loading} className="w-full">
                {loading ? "Đang lưu..." : "Lưu"}
              </Button>

            </div>
          </div>

          {/* ===== PASSWORD ===== */}
          <div className="p-6 rounded-2xl bg-card glow-border">

            <h3 className="font-bold mb-4">Đổi mật khẩu</h3>

            <div className="space-y-4">

              <Input
                type="password"
                placeholder="Mật khẩu mới"
                value={pwForm.password}
                onChange={(e) =>
                  setPwForm((p) => ({ ...p, password: e.target.value }))
                }
              />

              <Input
                type="password"
                placeholder="Xác nhận mật khẩu"
                value={pwForm.confirmPassword}
                onChange={(e) =>
                  setPwForm((p) => ({ ...p, confirmPassword: e.target.value }))
                }
              />

              <Button onClick={changePassword} disabled={pwLoading} variant="outline" className="w-full">
                {pwLoading ? "Đang cập nhật..." : "Đổi mật khẩu"}
              </Button>

            </div>
          </div>

        </div>

{/* ===== THEME ===== */}
{allowUserTheme && (
  <div className="mt-6 p-6 rounded-2xl bg-card glow-border">

    {/* Header */}
    <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
      <Palette className="w-4 h-4 text-primary" />
      Tùy chỉnh giao diện
    </h3>

    {/* Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

      {/* MODE */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border">
        <div>
          <p className="text-sm font-medium">Chế độ</p>
          <p className="text-xs text-muted-foreground">
            Dark / Light mode
          </p>
        </div>

        <Button size="sm" variant="outline" onClick={toggleMode}>
          {currentMode === "dark" ? "🌙 Tối" : "☀️ Sáng"}
        </Button>
      </div>

      {/* PRIMARY COLOR */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border">
        <div>
          <p className="text-sm font-medium">Màu chính</p>
          <p className="text-xs text-muted-foreground">
            Primary color
          </p>
        </div>

        <input
          type="color"
          value={hslToHex(currentPrimaryColor)}
          onChange={(e) =>
            setUserPrimaryColor(hexToHsl(e.target.value))
          }
          className="w-10 h-10 rounded-lg border border-border cursor-pointer shadow-sm hover:scale-105 transition"
        />
      </div>

      {/* BACKGROUND COLOR */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border">
        <div>
          <p className="text-sm font-medium">Màu nền</p>
          <p className="text-xs text-muted-foreground">
            Background
          </p>
        </div>

        <input
          type="color"
          value={hslToHex(currentBackgroundColor)}
          onChange={(e) =>
            setUserBackgroundColor(hexToHsl(e.target.value))
          }
          className="w-10 h-10 rounded-lg border border-border cursor-pointer shadow-sm hover:scale-105 transition"
        />
      </div>

      {/* ACTIONS */}
      <div className="flex flex-col gap-2 p-4 rounded-xl bg-secondary/50 border border-border">

        <Button
          size="sm"
          variant="outline"
          onClick={resetToSystemDefaults}
          className="w-full justify-center gap-1"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={forceDarkMode}
          className="w-full justify-center gap-1"
        >
          🌙 Dark
        </Button>

      </div>

    </div>
  </div>
)}

      </div>
    </MainLayout>
  );
};

export default ProfilePage;