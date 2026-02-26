import { useState, useEffect } from "react";
import { useThemeCustomizer, hexToHsl, hslToHex } from "@/contexts/ThemeCustomizerContext";
import { useAuth } from "@/lib/auth";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { RotateCcw, Save, Palette, Monitor, Sun, Moon } from "lucide-react";

const PRESET_COLORS = [
  { label: "Hồng", hex: "#ec4899" },
  { label: "Tím", hex: "#a855f7" },
  { label: "Xanh dương", hex: "#3b82f6" },
  { label: "Xanh lá", hex: "#22c55e" },
  { label: "Cam", hex: "#f97316" },
  { label: "Đỏ", hex: "#ef4444" },
  { label: "Vàng", hex: "#eab308" },
  { label: "Cyan", hex: "#06b6d4" },
];

const AdminSettings = () => {
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const {
    systemSettings,
    currentMode,
    currentPrimaryColor,
    currentBackgroundColor,
    currentAccentColor,
    allowUserTheme,
    toggleMode,
    updateSystemSettings,
  } = useThemeCustomizer();

  // Local state for editing
  const [defaultMode, setDefaultMode] = useState(systemSettings.default_mode);
  const [primaryHex, setPrimaryHex] = useState(hslToHex(systemSettings.primary_color));
  const [bgHex, setBgHex] = useState(hslToHex(systemSettings.background_color));
  const [accentHex, setAccentHex] = useState(hslToHex(systemSettings.accent_color));
  const [borderRadius, setBorderRadius] = useState(systemSettings.border_radius);
  const [allowUser, setAllowUser] = useState(systemSettings.allow_user_theme);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDefaultMode(systemSettings.default_mode);
    setPrimaryHex(hslToHex(systemSettings.primary_color));
    setBgHex(hslToHex(systemSettings.background_color));
    setAccentHex(hslToHex(systemSettings.accent_color));
    setBorderRadius(systemSettings.border_radius);
    setAllowUser(systemSettings.allow_user_theme);
  }, [systemSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSystemSettings({
        default_mode: defaultMode,
        primary_color: hexToHsl(primaryHex),
        background_color: hexToHsl(bgHex),
        accent_color: hexToHsl(accentHex),
        border_radius: borderRadius,
        allow_user_theme: allowUser,
      });
      toast({ title: "Thành công", description: "Đã lưu cấu hình hệ thống" });
    } catch {
      toast({ title: "Lỗi", description: "Không thể lưu cấu hình", variant: "destructive" });
    }
    setSaving(false);
  };

  const handleReset = () => {
    setPrimaryHex("#ec4899");
    setBgHex("#0a0a0f");
    setAccentHex("#ec4899");
    setBorderRadius("0.75rem");
    setDefaultMode("dark");
    setAllowUser(true);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Cấu hình</h1>
        <p className="text-muted-foreground text-sm">Cài đặt giao diện & hệ thống</p>
      </div>

      {/* Theme Mode */}
      <div className="glow-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Monitor size={20} className="text-primary" />
          <h3 className="text-lg font-bold text-foreground">Chế độ hiển thị</h3>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-foreground font-medium">Chế độ mặc định hệ thống</p>
            <p className="text-sm text-muted-foreground">
              Hiện tại: {defaultMode === "dark" ? "Tối" : "Sáng"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDefaultMode("light")}
              className={`p-2 rounded-lg transition-colors ${defaultMode === "light" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
            >
              <Sun size={18} />
            </button>
            <button
              onClick={() => setDefaultMode("dark")}
              className={`p-2 rounded-lg transition-colors ${defaultMode === "dark" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
            >
              <Moon size={18} />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <div>
            <p className="text-foreground font-medium">Cho phép user đổi theme</p>
            <p className="text-sm text-muted-foreground">User có thể tuỳ chỉnh giao diện riêng</p>
          </div>
          <Switch checked={allowUser} onCheckedChange={setAllowUser} />
        </div>
      </div>

      {/* Primary Color */}
      <div className="glow-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Palette size={20} className="text-primary" />
          <h3 className="text-lg font-bold text-foreground">Màu chính (Primary)</h3>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <input
            type="color"
            value={primaryHex}
            onChange={(e) => setPrimaryHex(e.target.value)}
            className="w-12 h-12 rounded-lg cursor-pointer border-2 border-border bg-transparent"
          />
          <div>
            <p className="text-foreground font-medium font-mono text-sm">{primaryHex}</p>
            <p className="text-muted-foreground text-xs">{hexToHsl(primaryHex)}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((c) => (
            <button
              key={c.hex}
              onClick={() => setPrimaryHex(c.hex)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${primaryHex === c.hex ? "border-foreground scale-110" : "border-transparent hover:scale-105"}`}
              style={{ backgroundColor: c.hex }}
              title={c.label}
            />
          ))}
        </div>
      </div>

      {/* Background + Accent */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glow-border rounded-2xl p-6">
          <h3 className="text-md font-bold text-foreground mb-3">Màu nền (Background)</h3>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={bgHex}
              onChange={(e) => setBgHex(e.target.value)}
              className="w-10 h-10 rounded-lg cursor-pointer border-2 border-border bg-transparent"
            />
            <span className="text-foreground font-mono text-sm">{bgHex}</span>
          </div>
        </div>
        <div className="glow-border rounded-2xl p-6">
          <h3 className="text-md font-bold text-foreground mb-3">Màu Accent (Glow)</h3>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={accentHex}
              onChange={(e) => setAccentHex(e.target.value)}
              className="w-10 h-10 rounded-lg cursor-pointer border-2 border-border bg-transparent"
            />
            <span className="text-foreground font-mono text-sm">{accentHex}</span>
          </div>
        </div>
      </div>

      {/* Border Radius */}
      <div className="glow-border rounded-2xl p-6">
        <h3 className="text-md font-bold text-foreground mb-3">Bo góc (Border Radius)</h3>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="0"
            max="1.5"
            step="0.125"
            value={parseFloat(borderRadius)}
            onChange={(e) => setBorderRadius(`${e.target.value}rem`)}
            className="flex-1 accent-primary"
          />
          <span className="text-foreground font-mono text-sm w-16 text-right">{borderRadius}</span>
        </div>
        <div className="flex gap-3 mt-3">
          {["0rem", "0.375rem", "0.75rem", "1rem", "1.5rem"].map((r) => (
            <button
              key={r}
              onClick={() => setBorderRadius(r)}
              className={`w-10 h-10 border-2 transition-all ${borderRadius === r ? "border-primary bg-primary/20" : "border-border bg-secondary"}`}
              style={{ borderRadius: r }}
            />
          ))}
        </div>
      </div>

      {/* Live Preview */}
      <div className="glow-border rounded-2xl p-6">
        <h3 className="text-md font-bold text-foreground mb-4">Xem trước</h3>
        <div
          className="p-6 rounded-xl border border-border/50"
          style={{
            backgroundColor: `hsl(${hexToHsl(bgHex)})`,
            borderRadius: borderRadius,
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: `hsl(${hexToHsl(primaryHex)})`, borderRadius: borderRadius }}
            >
              M
            </div>
            <span className="font-bold" style={{ color: defaultMode === "dark" ? "#fafafa" : "#1a1a2e" }}>
              Miyaru Admin
            </span>
          </div>
          <div className="flex gap-2 mb-3">
            <button
              className="px-4 py-2 text-sm font-medium text-white"
              style={{
                backgroundColor: `hsl(${hexToHsl(primaryHex)})`,
                borderRadius: borderRadius,
                boxShadow: `0 0 20px hsl(${hexToHsl(accentHex)} / 0.5)`,
              }}
            >
              Primary Button
            </button>
            <button
              className="px-4 py-2 text-sm font-medium border"
              style={{
                borderColor: `hsl(${hexToHsl(primaryHex)} / 0.5)`,
                color: `hsl(${hexToHsl(primaryHex)})`,
                borderRadius: borderRadius,
              }}
            >
              Outline
            </button>
          </div>
          <div
            className="p-3 text-sm"
            style={{
              backgroundColor: defaultMode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
              borderRadius: borderRadius,
              color: defaultMode === "dark" ? "#a1a1aa" : "#52525b",
            }}
          >
            Preview card content
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving || !isAdmin}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Save size={16} />
          {saving ? "Đang lưu..." : "Lưu cấu hình"}
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-6 py-2.5 bg-secondary text-foreground rounded-xl font-medium text-sm hover:bg-secondary/80 transition-colors"
        >
          <RotateCcw size={16} />
          Reset mặc định
        </button>
      </div>
      {!isAdmin && (
        <p className="text-sm text-destructive">Bạn cần quyền admin để thay đổi cấu hình hệ thống.</p>
      )}
    </div>
  );
};

export default AdminSettings;
