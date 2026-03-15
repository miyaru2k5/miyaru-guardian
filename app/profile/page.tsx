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
  Mail,
  Lock,
  Palette,
  RotateCcw,
  ImageIcon,
  Upload,
} from "lucide-react";
import MainLayout from "@/layouts/MainLayout";
import {
  useThemeCustomizer,
  hslToHex,
  hexToHsl,
} from "@/contexts/ThemeCustomizerContext";

const ProfilePage = () => {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);

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

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }
  }, [user, isLoading, router]);

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
      }
    };

    fetch();
  }, [user]);

  const uploadAvatar = async (file: File) => {
    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setAvatarUrl(data.url);

      toast({
        title: "Upload thành công",
        description: "Ảnh đã được lưu trên R2",
      });
    } catch (error: any) {
      toast({
        title: "Upload lỗi",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    uploadAvatar(file);
  };

  const updateProfile = async () => {
    if (!user) return;

    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        avatar_url: avatarUrl || null,
      })
      .eq("id", user.id);

    setLoading(false);

    if (error) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Đã cập nhật profile",
    });
  };

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

    toast({
      title: "Đã đổi mật khẩu",
    });

    setPwForm({
      password: "",
      confirmPassword: "",
    });
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-8rem)] pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">

          <div className="space-y-6">

            <div>
              <h1 className="text-2xl font-bold">Profile</h1>
              <p className="text-muted-foreground text-sm">
                Quản lý thông tin cá nhân
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* PROFILE */}
              <div className="glow-border rounded-2xl p-6 bg-card">

                <div className="flex items-center gap-4 mb-6">

                  <div className="relative">

                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={fullName}
                        className="w-20 h-20 rounded-full object-cover border-2 border-primary/30"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border-2 border-primary/30">
                        <span className="text-3xl font-bold text-primary">
                          {fullName?.charAt(0) || "U"}
                        </span>
                      </div>
                    )}

                  </div>

                  <div>
                    <h2 className="text-lg font-bold">
                      {fullName || "User"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>

                </div>

                <div className="space-y-4">

                  <div>
                    <label className="text-sm mb-1 flex items-center gap-1">
                      <User size={14} /> Họ tên
                    </label>

                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>

                  {/* AVATAR URL */}
                  <div>
                    <label className="text-sm mb-1 flex items-center gap-1">
                      <ImageIcon size={14} /> Avatar URL
                    </label>

                    <Input
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>

                  {/* UPLOAD FILE */}
                  <div>
                    <label className="text-sm mb-2 flex items-center gap-1">
                      <Upload size={14} /> Upload Avatar
                    </label>

                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                    />

                    {uploading && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Đang upload ảnh...
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm mb-1 flex items-center gap-1">
                      <Mail size={14} /> Email
                    </label>

                    <Input
                      value={user?.email || ""}
                      disabled
                      className="opacity-60"
                    />
                  </div>

                  <Button
                    onClick={updateProfile}
                    disabled={loading}
                    className="btn-glow"
                  >
                    {loading ? "Đang lưu..." : "Cập nhật"}
                  </Button>

                </div>

              </div>

              {/* PASSWORD */}
              <div className="glow-border rounded-2xl p-6 bg-card h-fit">

                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Lock size={18} /> Đổi mật khẩu
                </h3>

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
                      setPwForm((p) => ({
                        ...p,
                        confirmPassword: e.target.value,
                      }))
                    }
                  />

                  <Button
                    onClick={changePassword}
                    disabled={pwLoading}
                    variant="outline"
                  >
                    {pwLoading ? "Đang cập nhật..." : "Đổi mật khẩu"}
                  </Button>

                </div>

              </div>

            </div>

          </div>

        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;