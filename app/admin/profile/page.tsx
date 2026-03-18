"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { getAuthErrorMessage } from "@/lib/authErrors";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  User,
  Mail,
  Lock,
  Palette,
  RotateCcw,
  ImageIcon,
  Upload,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";

import {
  useThemeCustomizer,
  hslToHex,
  hexToHsl,
} from "@/contexts/ThemeCustomizerContext";

const R2_DOMAIN = process.env.NEXT_PUBLIC_R2_DOMAIN!;

const Profile = () => {
  const { user } = useAuth();

  const [_profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [oldAvatarUrl, setOldAvatarUrl] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  // 👉 preview only
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [loading, setLoading] = useState(false);

  const [pwForm, setPwForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [pwLoading, setPwLoading] = useState(false);

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

  // ================= LOAD PROFILE =================
  useEffect(() => {
    if (!user) return;

    const fetch = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data);
        setFullName(data.full_name || "");
        setAvatarUrl(data.avatar_url || "");
        setOldAvatarUrl(data.avatar_url || "");
      }
    };

    fetch();
  }, [user]);

  // ================= PREVIEW =================
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];
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

      // 👉 nếu có file mới thì upload khi bấm lưu
      if (selectedFile) {
        const newUrl = await uploadToR2(selectedFile);
        finalAvatar = newUrl;

        // 👉 xóa ảnh cũ nếu là R2
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground text-sm">
          Quản lý thông tin cá nhân
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PROFILE */}
        <div className="glow-border rounded-2xl p-6 bg-card">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-[3px] rounded-full bg-gradient-to-br from-primary to-primary/30">
              <div className="p-[2px] rounded-full bg-card">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : avatarUrl ? (
                  <img
                    src={avatarUrl}
                    className="w-20 h-20 rounded-full object-cover"
                  />
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
                <img src="/tick.gif" alt="verified" className="w-4 h-4" />
              </div>
              <p className="text-sm text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </div>

          <div className="space-y-4">

            {/* Họ tên */}
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                Họ tên
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nhập họ tên..."
                />
              </div>
            </div>

            {/* Upload */}
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                Tải ảnh lên
              </label>
              <div className="relative">
                <Upload className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {/* Avatar URL */}
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                Avatar URL
              </label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.png"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  className="pl-9 opacity-60"
                  value={user?.email || ""}
                  disabled
                />
              </div>
            </div>

            {/* Button */}
            <Button
              onClick={updateProfile}
              disabled={loading}
              className="w-full gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? "Đang lưu..." : "Cập nhật"}
            </Button>

          </div>
        </div>

        <div className="glow-border rounded-2xl p-6 bg-card h-fit">
          <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            Đổi mật khẩu
          </h3>

          <div className="space-y-4">

            {/* Mật khẩu mới */}
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                Mật khẩu mới
              </label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                <Input
                  className="pl-9 pr-10"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu mới..."
                  value={pwForm.password}
                  onChange={(e) =>
                    setPwForm((p) => ({
                      ...p,
                      password: e.target.value,
                    }))
                  }
                />

                {/* 👁️ toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Xác nhận mật khẩu */}
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                Xác nhận mật khẩu
              </label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                <Input
                  className="pl-9 pr-10"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu..."
                  value={pwForm.confirmPassword}
                  onChange={(e) =>
                    setPwForm((p) => ({
                      ...p,
                      confirmPassword: e.target.value,
                    }))
                  }
                />

                {/* 👁️ toggle */}
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                >
                  {showConfirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Button */}
            <Button
              onClick={changePassword}
              disabled={pwLoading}
              variant="outline"
              className="w-full gap-2"
            >
              <Lock className="w-4 h-4" />
              {pwLoading ? "Đang cập nhật..." : "Đổi mật khẩu"}
            </Button>

          </div>
        </div>
      </div>

      {/* 🔥 GIỮ NGUYÊN 100% THEME */}
      {allowUserTheme && (
        <div className="glow-border rounded-2xl p-6 bg-card">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Palette size={18} /> Tùy chỉnh giao diện
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border">
              <span className="text-sm text-muted-foreground">
                Chế độ hiển thị
              </span>

              <Button variant="outline" size="sm" onClick={toggleMode}>
                {currentMode === "dark" ? "🌙 Tối" : "☀️ Sáng"}
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border">
              <span className="text-sm text-muted-foreground">
                Màu chính
              </span>

              <input
                type="color"
                value={hslToHex(currentPrimaryColor)}
                onChange={(e) =>
                  setUserPrimaryColor(hexToHsl(e.target.value))
                }
                className="w-10 h-10 rounded-lg border border-border cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border">
              <span className="text-sm text-muted-foreground">
                Màu nền
              </span>

              <input
                type="color"
                value={hslToHex(currentBackgroundColor)}
                onChange={(e) =>
                  setUserBackgroundColor(hexToHsl(e.target.value))
                }
                className="w-10 h-10 rounded-lg border border-border cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/50 border border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={resetToSystemDefaults}
                className="flex-1"
              >
                <RotateCcw size={14} /> Reset
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={forceDarkMode}
                className="flex-1"
              >
                🌙 Tối
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;