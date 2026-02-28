import { useState, useEffect, useRef } from "react";
import { z } from "zod";
import { useThemeCustomizer, hexToHsl, hslToHex, SystemSettings } from "@/contexts/ThemeCustomizerContext";
import { useAuth } from "@/lib/auth";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  RotateCcw, Save, Palette, Monitor, Sun, Moon,
  Upload, Download, Building2, FileJson, Plus, Trash2,
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

const themeImportSchema = z.object({
  site_name: z.string().max(200).optional(),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  background_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  accent_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  border_radius: z.string().max(20).optional(),
  default_mode: z.enum(["dark", "light"]).optional(),
  allow_user_theme: z.boolean().optional(),
  footer: footerDataSchema.optional(),
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
  const { systemSettings, updateSystemSettings, refetchSystemSettings } = useThemeCustomizer();

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

  const [saving, setSaving] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

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

  const handleExport = () => {
    const exportData = {
      site_name: systemSettings.site_name,
      primary_color: hslToHex(systemSettings.primary_color),
      background_color: hslToHex(systemSettings.background_color),
      accent_color: hslToHex(systemSettings.accent_color),
      border_radius: systemSettings.border_radius,
      default_mode: systemSettings.default_mode,
      allow_user_theme: systemSettings.allow_user_theme,
      footer: systemSettings.footer_data,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `miyaru-theme-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Đã xuất theme" });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const raw = JSON.parse(ev.target?.result as string);
        const parsed = themeImportSchema.parse(raw);
        const updates: Partial<SystemSettings> = {};
        if (parsed.site_name !== undefined) updates.site_name = parsed.site_name;
        if (parsed.primary_color) updates.primary_color = hexToHsl(parsed.primary_color);
        if (parsed.background_color) updates.background_color = hexToHsl(parsed.background_color);
        if (parsed.accent_color) updates.accent_color = hexToHsl(parsed.accent_color);
        if (parsed.border_radius) updates.border_radius = parsed.border_radius;
        if (parsed.default_mode) updates.default_mode = parsed.default_mode;
        if (parsed.allow_user_theme !== undefined) updates.allow_user_theme = parsed.allow_user_theme;
        if (parsed.footer) (updates as any).footer_data = parsed.footer;
        await updateSystemSettings(updates);
        await refetchSystemSettings();
        toast({ title: "Thành công", description: "Đã import theme" });
      } catch (err: unknown) {
        const msg = err instanceof z.ZodError
          ? err.errors.map((e2) => `${e2.path.join(".")}: ${e2.message}`).join(", ")
          : err instanceof Error ? err.message : "Định dạng không hợp lệ";
        toast({ title: "Import thất bại", description: msg, variant: "destructive" });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
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
        <h1 className="text-2xl font-bold text-foreground">Cấu hình hệ thống</h1>
        <p className="text-muted-foreground text-sm">Appearance, Branding, Footer & Theme</p>
      </div>

      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="appearance" className="gap-1"><Palette size={14} /> Giao diện</TabsTrigger>
          <TabsTrigger value="branding" className="gap-1"><Building2 size={14} /> Branding</TabsTrigger>
          <TabsTrigger value="footer" className="gap-1"><FileJson size={14} /> Footer</TabsTrigger>
          <TabsTrigger value="export" className="gap-1"><Download size={14} /> Import/Export</TabsTrigger>
        </TabsList>

        {/* ===== APPEARANCE ===== */}
        <TabsContent value="appearance" className="space-y-6 mt-6">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {/* Live Preview */}
          <div className="glow-border rounded-2xl p-6">
            <h3 className="text-md font-bold text-foreground mb-4">Xem trước</h3>
            <div className="p-6 rounded-xl border border-border/50"
              style={{ backgroundColor: `hsl(${hexToHsl(bgHex)})`, borderRadius }}>
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
                style={{ backgroundColor: defaultMode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", borderRadius, color: defaultMode === "dark" ? "#a1a1aa" : "#52525b" }}>
                Preview card content
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
        <TabsContent value="branding" className="space-y-6 mt-6">
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
            {logoUrl && (
              <div className="flex items-center gap-3">
                <img src={logoUrl} alt="Logo preview" className="w-14 h-14 rounded-xl object-cover border border-border" />
                <span className="text-sm text-muted-foreground">Preview</span>
              </div>
            )}
            <Button onClick={handleSaveBranding} disabled={saving || !isAdmin} className="btn-glow gap-2">
              <Save size={16} /> Lưu Branding
            </Button>
          </div>
        </TabsContent>

        {/* ===== FOOTER ===== */}
        <TabsContent value="footer" className="space-y-6 mt-6">
          <div className="glow-border rounded-2xl p-6 bg-card space-y-5">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <FileJson size={20} className="text-primary" /> Footer Data
            </h3>
            <div className="grid gap-4">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <Button onClick={handleSaveFooter} disabled={saving || !isAdmin} className="btn-glow gap-2">
              <Save size={16} /> Lưu Footer
            </Button>
          </div>
        </TabsContent>

        {/* ===== EXPORT / IMPORT ===== */}
        <TabsContent value="export" className="space-y-6 mt-6">
          <div className="glow-border rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-foreground">Export / Import Theme</h3>
            <div className="flex gap-3">
              <Button onClick={handleExport} variant="outline" className="gap-2">
                <Download size={16} /> Export JSON
              </Button>
              <Button onClick={() => importRef.current?.click()} variant="outline" className="gap-2" disabled={!isAdmin}>
                <Upload size={16} /> Import JSON
              </Button>
              <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
            </div>
            <p className="text-xs text-muted-foreground">
              Export sẽ xuất toàn bộ cấu hình theme ra file JSON. Import sẽ validate và ghi đè cấu hình hiện tại.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {!isAdmin && <p className="text-sm text-destructive">Bạn cần quyền admin để thay đổi cấu hình.</p>}
    </div>
  );
};

export default AdminSettings;
