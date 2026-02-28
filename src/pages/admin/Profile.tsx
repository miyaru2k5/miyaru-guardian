import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { getAuthErrorMessage } from "@/lib/authErrors";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Lock, Palette, RotateCcw } from "lucide-react";
import { useThemeCustomizer, hslToHex, hexToHsl } from "@/contexts/ThemeCustomizerContext";

const Profile = () => {
  const { user } = useAuth();
  const [_profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [pwForm, setPwForm] = useState({ password: "", confirmPassword: "" });
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
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) { setProfile(data); setFullName(data.full_name); }
    };
    fetch();
  }, [user]);

  const updateProfile = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id);
    setLoading(false);
    if (error) { toast({ title: "Lỗi", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Đã cập nhật profile" });
  };

  const changePassword = async () => {
    if (pwForm.password.length < 6) { toast({ title: "Mật khẩu ít nhất 6 ký tự", variant: "destructive" }); return; }
    if (pwForm.password !== pwForm.confirmPassword) { toast({ title: "Mật khẩu không khớp", variant: "destructive" }); return; }
    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pwForm.password });
    setPwLoading(false);
    if (error) { toast({ title: "Lỗi", description: getAuthErrorMessage(error), variant: "destructive" }); return; }
    toast({ title: "Đã đổi mật khẩu" });
    setPwForm({ password: "", confirmPassword: "" });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground text-sm">Quản lý thông tin cá nhân</p>
      </div>

      {/* Avatar */}
      <div className="glow-border rounded-2xl p-6 bg-card">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border-2 border-primary/30">
              <span className="text-3xl font-bold text-primary">{fullName?.charAt(0) || "U"}</span>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">{fullName || "User"}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 flex items-center gap-1"><User size={14} /> Họ tên</label>
            <Input value={fullName} onChange={e => setFullName(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 flex items-center gap-1"><Mail size={14} /> Email</label>
            <Input value={user?.email || ""} disabled className="opacity-60" />
          </div>
          <Button onClick={updateProfile} disabled={loading} className="btn-glow">
            {loading ? "Đang lưu..." : "Cập nhật"}
          </Button>
        </div>
      </div>

      {/* Theme Customizer */}
      {allowUserTheme && (
        <div className="glow-border rounded-2xl p-6 bg-card">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Palette size={18} /> Tùy chỉnh giao diện
          </h3>
          <div className="space-y-4">
            {/* Mode toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Chế độ hiển thị</span>
              <Button variant="outline" size="sm" onClick={toggleMode}>
                {currentMode === "dark" ? "🌙 Tối" : "☀️ Sáng"}
              </Button>
            </div>

            {/* Primary color */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Màu chính</span>
              <input
                type="color"
                value={hslToHex(currentPrimaryColor)}
                onChange={e => setUserPrimaryColor(hexToHsl(e.target.value))}
                className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent"
              />
            </div>

            {/* Background color */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Màu nền</span>
              <input
                type="color"
                value={hslToHex(currentBackgroundColor)}
                onChange={e => setUserBackgroundColor(hexToHsl(e.target.value))}
                className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent"
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={resetToSystemDefaults} className="gap-1">
                <RotateCcw size={14} /> Đặt lại mặc định
              </Button>
              <Button variant="outline" size="sm" onClick={forceDarkMode} className="gap-1">
                🌙 Cố định chế độ tối
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password */}
      <div className="glow-border rounded-2xl p-6 bg-card">
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2"><Lock size={18} /> Đổi mật khẩu</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Mật khẩu mới</label>
            <Input type="password" value={pwForm.password} onChange={e => setPwForm(p => ({ ...p, password: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Xác nhận mật khẩu</label>
            <Input type="password" value={pwForm.confirmPassword} onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))} />
          </div>
          <Button onClick={changePassword} disabled={pwLoading} variant="outline">
            {pwLoading ? "Đang cập nhật..." : "Đổi mật khẩu"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
