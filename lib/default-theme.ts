/**
 * Default brand theme — single source of truth in code (not /admin/settings).
 * Reusable across CSS tokens, ThemeCustomizer, Tailwind, and UI helpers.
 *
 * | Component   | Hex       |
 * | ----------- | --------- |
 * | Primary     | #F97316   |
 * | Hover       | #EA580C   |
 * | Background  | #F8FAFC   |
 * | Card        | #FFFFFF   |
 * | Text        | #0F172A   |
 * | Text phụ    | #475569   |
 * | Border      | #E2E8F0   |
 * | Success     | #22C55E   |
 * | Warning     | #F59E0B   |
 * | Error       | #EF4444   |
 * | Info        | #3B82F6   |
 */

/** Hex palette (authoritative brand colors) */
export const defaultPaletteHex = {
  primary: "#F97316",
  hover: "#EA580C",
  background: "#F8FAFC",
  card: "#FFFFFF",
  text: "#0F172A",
  textMuted: "#475569",
  border: "#E2E8F0",
  success: "#22C55E",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",
} as const;

export type PaletteKey = keyof typeof defaultPaletteHex;

/** HSL channel strings without `hsl()` — for CSS vars: `hsl(var(--primary))` */
export const defaultPaletteHsl = {
  primary: "25 95% 53%",
  hover: "21 90% 48%",
  background: "210 40% 98%",
  card: "0 0% 100%",
  text: "222 47% 11%",
  textMuted: "215 16% 47%",
  border: "214 32% 91%",
  success: "142 71% 45%",
  warning: "38 92% 50%",
  error: "0 84% 60%",
  info: "217 91% 60%",
  /** White / near-white on primary buttons */
  onPrimary: "0 0% 100%",
} as const;

/** Dark-mode semantic map derived from the same brand primary + slate surfaces */
export const defaultDarkPaletteHsl = {
  primary: defaultPaletteHsl.primary,
  hover: defaultPaletteHsl.hover,
  background: "222 47% 6%",
  card: "222 47% 11%",
  text: "210 40% 98%",
  textMuted: "215 20% 65%",
  border: "217 19% 22%",
  success: defaultPaletteHsl.success,
  warning: defaultPaletteHsl.warning,
  error: defaultPaletteHsl.error,
  info: defaultPaletteHsl.info,
  onPrimary: defaultPaletteHsl.onPrimary,
  secondary: "217 19% 16%",
  muted: "217 19% 14%",
  sidebar: "222 47% 8%",
  sidebarBorder: "217 19% 18%",
} as const;

/** Light-mode full semantic map (matches table above) */
export const defaultLightPaletteHsl = {
  primary: defaultPaletteHsl.primary,
  hover: defaultPaletteHsl.hover,
  background: defaultPaletteHsl.background,
  card: defaultPaletteHsl.card,
  text: defaultPaletteHsl.text,
  textMuted: defaultPaletteHsl.textMuted,
  border: defaultPaletteHsl.border,
  success: defaultPaletteHsl.success,
  warning: defaultPaletteHsl.warning,
  error: defaultPaletteHsl.error,
  info: defaultPaletteHsl.info,
  onPrimary: defaultPaletteHsl.onPrimary,
  secondary: "210 40% 96%",
  muted: "210 40% 96%",
  sidebar: defaultPaletteHsl.card,
  sidebarBorder: defaultPaletteHsl.border,
} as const;

export type ThemeMode = "light" | "dark";

/**
 * Full system config in code (no `system_settings` table).
 * Edit here to change brand, mode, logo, etc. across the app.
 */
export const defaultThemeConfig = {
  /** Default UI mode when user has no preference */
  defaultMode: "light" as ThemeMode,
  borderRadius: "10px",
  /** User may toggle dark/light + optional personal primary via profile/localStorage */
  allowUserTheme: true,
  siteName:
    (typeof process !== "undefined" &&
      process.env.NEXT_PUBLIC_WEBSITE_TITLE) ||
    "Admin",
  logoUrl: "/logo.gif",
  /** Google OAuth always on (Supabase provider config); kept for UI flags */
  authGoogleEnabled: true,
  hex: defaultPaletteHex,
  hsl: defaultPaletteHsl,
  light: defaultLightPaletteHsl,
  dark: defaultDarkPaletteHsl,
  /** Shape compatible with ThemeCustomizer `systemSettings` */
  system: {
    primary_color: defaultPaletteHsl.primary,
    background_color: defaultPaletteHsl.background,
    accent_color: defaultPaletteHsl.primary,
    border_radius: "10px",
    default_mode: "light" as ThemeMode,
    allow_user_theme: true,
    site_name:
      (typeof process !== "undefined" &&
        process.env.NEXT_PUBLIC_WEBSITE_TITLE) ||
      "Admin",
    logo_url: "/logo.gif",
    auth_google_enabled: true,
    auth_google_client_id: null as string | null,
  },
} as const;

export type DefaultThemeConfig = typeof defaultThemeConfig;

export function paletteForMode(mode: ThemeMode) {
  return mode === "light" ? defaultLightPaletteHsl : defaultDarkPaletteHsl;
}

/**
 * Apply semantic color CSS variables for a mode.
 * Does not touch --radius (callers set that separately if needed).
 */
export function applyDefaultPaletteToRoot(
  root: CSSStyleDeclaration | HTMLElement,
  mode: ThemeMode,
  options?: { primaryOverride?: string; accentOverride?: string }
) {
  const p = paletteForMode(mode);
  const primary = options?.primaryOverride || p.primary;
  const accent = options?.accentOverride || primary;
  const hover = p.hover;

  const set = (name: string, value: string) => {
    if (root instanceof CSSStyleDeclaration) {
      root.setProperty(name, value);
    } else {
      root.style.setProperty(name, value);
    }
  };

  set("--background", p.background);
  set("--foreground", p.text);
  set("--card", p.card);
  set("--card-foreground", p.text);
  set("--popover", p.card);
  set("--popover-foreground", p.text);
  set("--primary", primary);
  set("--primary-hover", hover);
  set("--primary-foreground", p.onPrimary);
  set("--secondary", p.secondary);
  set("--secondary-foreground", p.text);
  set("--muted", p.muted);
  set("--muted-foreground", p.textMuted);
  set("--accent", accent);
  set("--accent-foreground", p.onPrimary);
  set("--destructive", p.error);
  set("--destructive-foreground", p.onPrimary);
  set("--success", p.success);
  set("--success-foreground", p.onPrimary);
  set("--warning", p.warning);
  set("--warning-foreground", mode === "light" ? p.text : p.onPrimary);
  set("--info", p.info);
  set("--info-foreground", p.onPrimary);
  set("--border", p.border);
  set("--input", p.border);
  set("--ring", primary);
  set("--sidebar", p.sidebar);
  set("--sidebar-foreground", p.text);
  set("--sidebar-border", p.sidebarBorder);

  set("--glow-primary", `0 0 20px hsl(${primary} / 0.45)`);
  set("--glow-primary-strong", `0 0 40px hsl(${primary} / 0.65)`);
  set(
    "--gradient-primary",
    `linear-gradient(135deg, hsl(${primary}) 0%, hsl(${hover}) 100%)`
  );
  if (mode === "light") {
    set(
      "--gradient-card",
      `linear-gradient(145deg, hsl(${p.card}) 0%, hsl(${p.background}) 100%)`
    );
  } else {
    set(
      "--gradient-card",
      `linear-gradient(145deg, hsl(${p.card}) 0%, hsl(${p.background}) 100%)`
    );
    set(
      "--gradient-dark",
      `linear-gradient(180deg, hsl(${p.sidebar}) 0%, hsl(${p.background}) 100%)`
    );
  }
}

export function hexToHsl(hex: string): string {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const r = parseInt(h.substring(0, 2), 16) / 255;
  const g = parseInt(h.substring(2, 4), 16) / 255;
  const b = parseInt(h.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let hue = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        hue = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        hue = ((b - r) / d + 2) / 6;
        break;
      case b:
        hue = ((r - g) / d + 4) / 6;
        break;
    }
  }
  return `${Math.round(hue * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function hslToHex(hslStr: string): string {
  const parts = hslStr.match(/[\d.]+/g);
  if (!parts || parts.length < 3) return defaultPaletteHex.primary;
  const h = parseFloat(parts[0]) / 360;
  const s = parseFloat(parts[1]) / 100;
  const l = parseFloat(parts[2]) / 100;
  let r: number;
  let g: number;
  let b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      let tt = t;
      if (tt < 0) tt += 1;
      if (tt > 1) tt -= 1;
      if (tt < 1 / 6) return p + (q - p) * 6 * tt;
      if (tt < 1 / 2) return q;
      if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** Convenience: css color string from palette key */
export function paletteHex(key: PaletteKey): string {
  return defaultPaletteHex[key];
}

export function paletteCssVar(token: string): string {
  return `hsl(var(--${token}))`;
}
