import { useState, useEffect } from "react";
import { z } from "zod";
import { useThemeCustomizer, hexToHsl, hslToHex } from "@/contexts/ThemeCustomizerContext";
import { useAuth } from "@/lib/auth";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  RotateCcw, Save, Palette, Monitor, Sun, Moon,
  Building2, FileJson, Plus, Trash2, LogIn,
} from "lucide-react";

const footerDataSchema = z.object({
  brand_name: z.string().min(1, "brand_name bắt buộc").max(200),
  description: z.string().max(1000).optional().default(""),
  services: z.array(z.string().max(200)).max(20).optional().default([]),
  contact: z.object({
    phone: z.string().max(50),
    email: z.string().email("Email không hợp lệ").max(255),
  }),
  copyright: z.string().max(500).optional().default(""),
});


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
  const { systemSettings, updateSystemSettings } = useThemeCustomizer();

  // Appearance
  const [defaultMode, setDefaultMode] = useState(systemSettings.default_mode);
  const [primaryHex, setPrimaryHex] = useState(hslToHex(systemSettings.primary_color));
  const [bgHex, setBgHex] = useState(hslToHex(systemSettings.background_color));
  const [accentHex, setAccentHex] = useState(hslToHex(systemSettings.accent_color));
  const [borderRadius, setBorderRadius] = useState(systemSettings.border_radius);
  const [allowUser, setAllowUser] = useState(systemSettings.allow_user_theme);

  // Branding
  const [siteName, setSiteName] = useState(systemSettings.site_name);
  const [logoUrl, setLogoUrl] = useState(systemSettings.logo_url || "");

  // Footer - form state
  const [footerBrandName, setFooterBrandName] = useState(systemSettings.footer_data?.brand_name ?? "");
  const [footerDescription, setFooterDescription] = useState(systemSettings.footer_data?.description ?? "");
  const [footerServices, setFooterServices] = useState<string[]>(systemSettings.footer_data?.services ?? []);
  const [footerPhone, setFooterPhone] = useState(systemSettings.footer_data?.contact?.phone ?? "");
  const [footerEmail, setFooterEmail] = useState(systemSettings.footer_data?.contact?.email ?? "");
  const [footerCopyright, setFooterCopyright] = useState(systemSettings.footer_data?.copyright ?? "");

  // Auth - Google login
  const [authGoogleEnabled, setAuthGoogleEnabled] = useState(systemSettings.auth_google_enabled ?? false);
  const [authGoogleClientId, setAuthGoogleClientId] = useState(systemSettings.auth_google_client_id ?? "");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDefaultMode(systemSettings.default_mode);
    setPrimaryHex(hslToHex(systemSettings.primary_color));
    setBgHex(hslToHex(systemSettings.background_color));
    setAccentHex(hslToHex(systemSettings.accent_color));
    setBorderRadius(systemSettings.border_radius);
    setAllowUser(systemSettings.allow_user_theme);
    setSiteName(systemSettings.site_name);
    setLogoUrl(systemSettings.logo_url || "");
    setFooterBrandName(systemSettings.footer_data?.brand_name ?? "");
    setFooterDescription(systemSettings.footer_data?.description ?? "");
    setFooterServices(systemSettings.footer_data?.services ?? []);
    setFooterPhone(systemSettings.footer_data?.contact?.phone ?? "");
    setFooterEmail(systemSettings.footer_data?.contact?.email ?? "");
    setFooterCopyright(systemSettings.footer_data?.copyright ?? "");
    setAuthGoogleEnabled(systemSettings.auth_google_enabled ?? false);
    setAuthGoogleClientId(systemSettings.auth_google_client_id ?? "");
  }, [systemSettings]);

  const handleSaveAppearance = async () => {
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
      toast({ title: "Thành công", description: "Đã lưu cấu hình giao diện" });
    } catch {
      toast({ title: "Lỗi", description: "Không thể lưu", variant: "destructive" });
    }
    setSaving(false);
  };

  const handleSaveBranding = async () => {
    setSaving(true);
    try {
      await updateSystemSettings({ site_name: siteName, logo_url: logoUrl || null } as any);
      toast({ title: "Thành công", description: "Đã lưu branding" });
    } catch {
      toast({ title: "Lỗi", description: "Không thể lưu", variant: "destructive" });
    }
    setSaving(false);
  };

  const handleSaveFooter = async () => {
    try {
      const validated = footerDataSchema.parse({
        brand_name: footerBrandName.trim(),
        description: footerDescription.trim() || "",
        services: footerServices.filter(Boolean),
        contact: { phone: footerPhone.trim(), email: footerEmail.trim() },
        copyright: footerCopyright.trim() || "",
      });
      setSaving(true);
      await updateSystemSettings({ footer_data: validated } as any);
      toast({ title: "Thành công", description: "Đã lưu footer" });
    } catch (e: unknown) {
      const msg = e instanceof z.ZodError
        ? e.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join(", ")
        : e instanceof Error ? e.message : "Dữ liệu không hợp lệ";
      toast({ title: "Lỗi", description: msg, variant: "destructive" });
    }
    setSaving(false);
  };

  const addFooterService = () => setFooterServices((s) => [...s, ""]);
  const removeFooterService = (i: number) => setFooterServices((s) => s.filter((_, j) => j !== i));
  const setFooterServiceAt = (i: number, v: string) =>
    setFooterServices((s) => s.map((x, j) => (j === i ? v : x)));

  const handleSaveAuth = async () => {
    setSaving(true);
    try {
      await updateSystemSettings({
        auth_google_enabled: authGoogleEnabled,
        auth_google_client_id: authGoogleClientId.trim() || null,
      } as any);
      toast({ title: "Thành công", description: "Đã lưu cấu hình đăng nhập" });
    } catch {
      toast({ title: "Lỗi", description: "Không thể lưu", variant: "destructive" });
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Cấu hình hệ thống</h1>
        <p className="text-muted-foreground text-sm">Appearance, Branding, Footer & Theme</p>
      </div>

      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="appearance" className="gap-1"><Palette size={14} /> Giao diện</TabsTrigger>
          <TabsTrigger value="branding" className="gap-1"><Building2 size={14} /> Branding</TabsTrigger>
          <TabsTrigger value="footer" className="gap-1"><FileJson size={14} /> Footer</TabsTrigger>
          <TabsTrigger value="auth" className="gap-1"><LogIn size={14} /> Đăng nhập</TabsTrigger>
        </TabsList>

        {/* ===== APPEARANCE ===== */}
        <TabsContent value="appearance" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-6">
              {/* Mode */}
              <div className="glow-border rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Monitor size={20} className="text-primary" />
                  <h3 className="text-lg font-bold text-foreground">Chế độ hiển thị</h3>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-foreground font-medium">Chế độ mặc định</p>
                    <p className="text-sm text-muted-foreground">{defaultMode === "dark" ? "Tối" : "Sáng"}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setDefaultMode("light")}
                      className={`p-2 rounded-lg transition-colors ${defaultMode === "light" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                      <Sun size={18} />
                    </button>
                    <button onClick={() => setDefaultMode("dark")}
                      className={`p-2 rounded-lg transition-colors ${defaultMode === "dark" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                      <Moon size={18} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <div>
                    <p className="text-foreground font-medium">Cho phép user đổi theme</p>
                    <p className="text-sm text-muted-foreground">User có thể tuỳ chỉnh riêng</p>
                  </div>
                  <Switch checked={allowUser} onCheckedChange={setAllowUser} />
                </div>
              </div>

              {/* Primary */}
              <div className="glow-border rounded-2xl p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">Màu chính (Primary)</h3>
                <div className="flex items-center gap-4 mb-4">
                  <input type="color" value={primaryHex} onChange={e => setPrimaryHex(e.target.value)}
                    className="w-12 h-12 rounded-lg cursor-pointer border-2 border-border bg-transparent" />
                  <div>
                    <p className="text-foreground font-mono text-sm">{primaryHex}</p>
                    <p className="text-muted-foreground text-xs">{hexToHsl(primaryHex)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map(c => (
                    <button key={c.hex} onClick={() => setPrimaryHex(c.hex)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${primaryHex === c.hex ? "border-foreground scale-110" : "border-transparent hover:scale-105"}`}
                      style={{ backgroundColor: c.hex }} title={c.label} />
                  ))}
                </div>
              </div>

              {/* BG + Accent */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glow-border rounded-2xl p-6">
                  <h3 className="text-md font-bold text-foreground mb-3">Màu nền</h3>
                  <div className="flex items-center gap-3">
                    <input type="color" value={bgHex} onChange={e => setBgHex(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border-2 border-border bg-transparent" />
                    <span className="text-foreground font-mono text-sm">{bgHex}</span>
                  </div>
                </div>
                <div className="glow-border rounded-2xl p-6">
                  <h3 className="text-md font-bold text-foreground mb-3">Màu Accent</h3>
                  <div className="flex items-center gap-3">
                    <input type="color" value={accentHex} onChange={e => setAccentHex(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border-2 border-border bg-transparent" />
                    <span className="text-foreground font-mono text-sm">{accentHex}</span>
                  </div>
                </div>
              </div>

              {/* Border Radius */}
              <div className="glow-border rounded-2xl p-6">
                <h3 className="text-md font-bold text-foreground mb-3">Bo góc</h3>
                <div className="flex items-center gap-4">
                  <input type="range" min="0" max="1.5" step="0.125" value={parseFloat(borderRadius)}
                    onChange={e => setBorderRadius(`${e.target.value}rem`)} className="flex-1 accent-primary" />
                  <span className="text-foreground font-mono text-sm w-16 text-right">{borderRadius}</span>
                </div>
                <div className="flex gap-3 mt-3">
                  {["0rem", "0.375rem", "0.75rem", "1rem", "1.5rem"].map(r => (
                    <button key={r} onClick={() => setBorderRadius(r)}
                      className={`w-10 h-10 border-2 transition-all ${borderRadius === r ? "border-primary bg-primary/20" : "border-border bg-secondary"}`}
                      style={{ borderRadius: r }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Right column - Preview */}
            <div className="space-y-6">
              <div className="glow-border rounded-2xl p-6 lg:sticky lg:top-20">
                <h3 className="text-md font-bold text-foreground mb-4">Xem trước</h3>
                <div className="p-6 rounded-xl border"
                  style={{
                    backgroundColor: defaultMode === "dark" ? "#0a0a10" : "#fafafa",
                    borderColor: defaultMode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                    borderRadius,
                  }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: `hsl(${hexToHsl(primaryHex)})`, borderRadius }}>M</div>
                    <span className="font-bold" style={{ color: defaultMode === "dark" ? "#fafafa" : "#1a1a2e" }}>
                      {siteName || "Miyaru"} Admin
                    </span>
                  </div>
                  <div className="flex gap-2 mb-3">
                    <button className="px-4 py-2 text-sm font-medium text-white"
                      style={{ backgroundColor: `hsl(${hexToHsl(primaryHex)})`, borderRadius, boxShadow: `0 0 20px hsl(${hexToHsl(accentHex)} / 0.5)` }}>
                      Primary Button
                    </button>
                    <button className="px-4 py-2 text-sm font-medium border"
                      style={{ borderColor: `hsl(${hexToHsl(primaryHex)} / 0.5)`, color: `hsl(${hexToHsl(primaryHex)})`, borderRadius }}>
                      Outline
                    </button>
                  </div>
                  <div className="p-3 text-sm"
                    style={{
                      backgroundColor: defaultMode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                      borderRadius,
                      color: defaultMode === "dark" ? "#a1a1aa" : "#52525b",
                    }}>
                    Preview card content
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button onClick={handleSaveAppearance} disabled={saving || !isAdmin} className="btn-glow gap-2">
              <Save size={16} /> {saving ? "Đang lưu..." : "Lưu giao diện"}
            </Button>
            <Button onClick={handleReset} variant="secondary" className="gap-2">
              <RotateCcw size={16} /> Reset
            </Button>
          </div>
        </TabsContent>

        {/* ===== BRANDING ===== */}
        <TabsContent value="branding" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glow-border rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Building2 size={20} className="text-primary" /> Branding Settings
              </h3>
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Tên website</label>
                <Input value={siteName} onChange={e => setSiteName(e.target.value)} placeholder="Miyaru" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Logo URL</label>
                <Input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://..." />
              </div>
              <Button onClick={handleSaveBranding} disabled={saving || !isAdmin} className="btn-glow gap-2">
                <Save size={16} /> Lưu Branding
              </Button>
            </div>
            {logoUrl && (
              <div className="glow-border rounded-2xl p-6 flex flex-col items-center justify-center">
                <img src={logoUrl} alt="Logo preview" className="w-24 h-24 rounded-2xl object-cover border border-border mb-3" />
                <span className="text-sm text-muted-foreground">Logo Preview</span>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ===== FOOTER ===== */}
        <TabsContent value="footer" className="mt-6">
          <div className="glow-border rounded-2xl p-6 bg-card space-y-5">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <FileJson size={20} className="text-primary" /> Footer Data
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground block mb-1">Tên thương hiệu</label>
                  <Input value={footerBrandName} onChange={e => setFooterBrandName(e.target.value)} placeholder="Miyaru" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-1">Mô tả</label>
                  <Input value={footerDescription} onChange={e => setFooterDescription(e.target.value)}
                    placeholder="Chi phí thấp – Nhanh chóng – Chất lượng." />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-1">Danh sách dịch vụ</label>
                  <div className="space-y-2">
                    {footerServices.map((svc, i) => (
                      <div key={i} className="flex gap-2">
                        <Input value={svc} onChange={e => setFooterServiceAt(i, e.target.value)}
                          placeholder={`Dịch vụ ${i + 1}`} className="flex-1" />
                        <Button type="button" variant="outline" size="icon" onClick={() => removeFooterService(i)}
                          className="shrink-0 text-destructive hover:text-destructive">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={addFooterService} className="gap-1">
                      <Plus size={14} /> Thêm dịch vụ
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">Điện thoại</label>
                    <Input value={footerPhone} onChange={e => setFooterPhone(e.target.value)}
                      placeholder="0357.175.172" />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">Email</label>
                    <Input type="email" value={footerEmail} onChange={e => setFooterEmail(e.target.value)}
                      placeholder="contact@miyaru.vn" />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-1">Bản quyền</label>
                  <Input value={footerCopyright} onChange={e => setFooterCopyright(e.target.value)}
                    placeholder="© 2026 Miyaru Team." />
                </div>
              </div>
            </div>
            <Button onClick={handleSaveFooter} disabled={saving || !isAdmin} className="btn-glow gap-2">
              <Save size={16} /> Lưu Footer
            </Button>
          </div>
        </TabsContent>

        {/* ===== AUTH / ĐĂNG NHẬP ===== */}
        <TabsContent value="auth" className="mt-6">
          <div className="glow-border rounded-2xl p-6 space-y-5">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <LogIn size={20} className="text-primary" /> Cấu hình đăng nhập Google
            </h3>
            <p className="text-sm text-muted-foreground">
              Bật đăng nhập bằng Google sẽ hiển thị nút &quot;Đăng nhập với Google&quot; trên trang Login và Đăng ký. Cấu hình OAuth (Client ID / Secret) thực tế tại Supabase Dashboard → Auth → Providers → Google.
            </p>
            <div className="space-y-4 max-w-xl">
              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border">
                <div>
                  <p className="text-foreground font-medium">Bật đăng nhập Google</p>
                  <p className="text-sm text-muted-foreground">Hiển thị nút đăng nhập với Google trên Login & Đăng ký</p>
                </div>
                <Switch checked={authGoogleEnabled} onCheckedChange={setAuthGoogleEnabled} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Google OAuth Client ID (tham chiếu)</label>
                <Input
                  value={authGoogleClientId}
                  onChange={e => setAuthGoogleClientId(e.target.value)}
                  placeholder="xxx.apps.googleusercontent.com"
                />
                <p className="text-xs text-muted-foreground mt-1">Lưu để tham chiếu; cấu hình đầy đủ tại Supabase Dashboard.</p>
              </div>
            </div>
            <Button onClick={handleSaveAuth} disabled={saving || !isAdmin} className="btn-glow gap-2">
              <Save size={16} /> Lưu cấu hình đăng nhập
            </Button>
          </div>
        </TabsContent>

      </Tabs>

      {!isAdmin && <p className="text-sm text-destructive">Bạn cần quyền admin để thay đổi cấu hình.</p>}
    </div>
  );
};

export default AdminSettings;
