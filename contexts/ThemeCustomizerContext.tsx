"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

interface FooterData {
  brand_name: string;
  description: string;
  services: string[];
  contact: { phone: string; email: string };
  copyright: string;
}

export interface SystemSettings {
  default_mode: string;
  primary_color: string;
  background_color: string;
  accent_color: string;
  border_radius: string;
  allow_user_theme: boolean;
  site_name: string;
  logo_url: string | null;
  footer_data: FooterData;
  auth_google_enabled: boolean;
  auth_google_client_id: string | null;
}

interface ThemeCustomizerContextType {
  systemSettings: SystemSettings;
  currentMode: "dark" | "light";
  currentPrimaryColor: string;
  currentBackgroundColor: string;
  currentAccentColor: string;
  currentBorderRadius: string;
  allowUserTheme: boolean;
  isLoading: boolean;
  toggleMode: () => void;
  setUserPrimaryColor: (color: string) => void;
  setUserBackgroundColor: (color: string) => void;
  resetToSystemDefaults: () => void;
  forceDarkMode: () => void;
  updateSystemSettings: (settings: Partial<SystemSettings>) => Promise<void>;
  refetchSystemSettings: () => Promise<void>;
}

const DEFAULT_FOOTER: FooterData = {
  brand_name: "Admin",
  description: "Chi phí thấp – Nhanh chóng – Chất lượng.",
  services: ["Giao dịch trung gian", "Giao dịch viên"],
  contact: { phone: "0357.175.172", email: "contact@Admin.vn" },
  copyright: "© 2026 Admin Team.",
};

const DEFAULT_SETTINGS: SystemSettings = {
  default_mode: "dark",
  primary_color: "330 100% 55%",
  background_color: "240 10% 4%",
  accent_color: "330 100% 55%",
  border_radius: "0.75rem",
  allow_user_theme: true,
  site_name: "𝐀𝐝𝐦𝐢𝐧 𝐌𝐢𝐲𝐚𝐫𝐮",
  logo_url: "/logo.gif",
  footer_data: DEFAULT_FOOTER,
  auth_google_enabled: false,
  auth_google_client_id: null,
};

const DARK_BG = "240 10% 4%";
const LIGHT_BG = "0 0% 98%";

const ThemeCustomizerContext = createContext<ThemeCustomizerContextType | undefined>(undefined);

function applyThemeToDOM(mode: "dark" | "light", primary: string, _bg: string, accent: string, radius: string) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(mode);
  root.setAttribute("data-theme", mode);

  root.style.setProperty("--primary", primary);
  root.style.setProperty("--accent", accent);
  root.style.setProperty("--ring", primary);
  root.style.setProperty("--radius", radius);

  if (mode === "dark") {
    root.style.setProperty("--background", DARK_BG);
    root.style.setProperty("--foreground", "0 0% 98%");
    root.style.setProperty("--card", "240 10% 8%");
    root.style.setProperty("--card-foreground", "0 0% 98%");
    root.style.setProperty("--popover", "240 10% 8%");
    root.style.setProperty("--popover-foreground", "0 0% 98%");
    root.style.setProperty("--primary-foreground", "0 0% 100%");
    root.style.setProperty("--secondary", "240 10% 12%");
    root.style.setProperty("--secondary-foreground", "0 0% 98%");
    root.style.setProperty("--muted", "240 10% 15%");
    root.style.setProperty("--muted-foreground", "240 5% 65%");
    root.style.setProperty("--accent-foreground", "0 0% 100%");
    root.style.setProperty("--destructive", "0 84% 60%");
    root.style.setProperty("--destructive-foreground", "0 0% 98%");
    root.style.setProperty("--border", "240 10% 18%");
    root.style.setProperty("--input", "240 10% 18%");
  } else {
    root.style.setProperty("--background", LIGHT_BG);
    root.style.setProperty("--foreground", "240 10% 10%");
    root.style.setProperty("--card", "0 0% 100%");
    root.style.setProperty("--card-foreground", "240 10% 10%");
    root.style.setProperty("--popover", "0 0% 100%");
    root.style.setProperty("--popover-foreground", "240 10% 10%");
    root.style.setProperty("--primary-foreground", "0 0% 100%");
    root.style.setProperty("--secondary", "240 5% 92%");
    root.style.setProperty("--secondary-foreground", "240 10% 10%");
    root.style.setProperty("--muted", "240 5% 90%");
    root.style.setProperty("--muted-foreground", "240 5% 40%");
    root.style.setProperty("--accent-foreground", "0 0% 100%");
    root.style.setProperty("--destructive", "0 84% 50%");
    root.style.setProperty("--destructive-foreground", "0 0% 100%");
    root.style.setProperty("--border", "240 5% 85%");
    root.style.setProperty("--input", "240 5% 85%");
  }
}

export function hexToHsl(hex: string): string {
  hex = hex.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function hslToHex(hslStr: string): string {
  const parts = hslStr.match(/[\d.]+/g);
  if (!parts || parts.length < 3) return "#ec4899";
  const h = parseFloat(parts[0]) / 360;
  const s = parseFloat(parts[1]) / 100;
  const l = parseFloat(parts[2]) / 100;
  let r: number, g: number, b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function getInitialThemeFromStorage() {
  if (typeof window === "undefined") return { mode: null as string | null, primary: null as string | null, bg: null as string | null };
  return {
    mode: localStorage.getItem("miyaru-theme-mode"),
    primary: localStorage.getItem("miyaru-primary-color"),
    bg: localStorage.getItem("miyaru-bg-color"),
  };
}

export const ThemeCustomizerProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [userMode, setUserMode] = useState<string | null>(() => getInitialThemeFromStorage().mode);
  const [userPrimary, setUserPrimary] = useState<string | null>(() => getInitialThemeFromStorage().primary);
  const [userBg, setUserBg] = useState<string | null>(() => getInitialThemeFromStorage().bg);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSystemSettings = useCallback(async () => {
    const { data } = await supabase
      .from("system_settings")
      .select("*")
      .limit(1)
      .maybeSingle();
    if (data) {
      const d = data as any;
      setSystemSettings({
        default_mode: data.default_mode,
        primary_color: data.primary_color,
        background_color: data.background_color,
        accent_color: data.accent_color,
        border_radius: data.border_radius,
        allow_user_theme: data.allow_user_theme,
        site_name: d.site_name || "Miyaru",
        logo_url: d.logo_url || null,
        footer_data: d.footer_data || DEFAULT_FOOTER,
        auth_google_enabled: d.auth_google_enabled ?? false,
        auth_google_client_id: d.auth_google_client_id ?? null,
      });
    }
  }, []);

  const fetchUserTheme = useCallback(async () => {
    if (!user) {
      const saved = localStorage.getItem("miyaru-theme-mode");
      const savedPrimary = localStorage.getItem("miyaru-primary-color");
      const savedBg = localStorage.getItem("miyaru-bg-color");
      setUserMode(saved);
      setUserPrimary(savedPrimary);
      setUserBg(savedBg);
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("theme_mode, custom_primary_color, custom_background_color")
      .eq("id", user.id)
      .maybeSingle();
    if (data) {
      setUserMode(data.theme_mode ?? localStorage.getItem("miyaru-theme-mode"));
      setUserPrimary(data.custom_primary_color ?? localStorage.getItem("miyaru-primary-color"));
      setUserBg(data.custom_background_color ?? localStorage.getItem("miyaru-bg-color"));
    }
  }, [user]);

  useEffect(() => {
    Promise.all([fetchSystemSettings(), fetchUserTheme()]).then(() => setIsLoading(false));
  }, [fetchSystemSettings, fetchUserTheme]);

  const allowUserTheme = systemSettings.allow_user_theme;
  const systemDefault = systemSettings.default_mode === "light" ? "light" : "dark";
  const currentMode = ((allowUserTheme && userMode) || systemDefault) as "dark" | "light";
  const currentPrimaryColor = (allowUserTheme && userPrimary) || systemSettings.primary_color;
  const currentBackgroundColor = (allowUserTheme && userBg) || systemSettings.background_color;
  const currentAccentColor = systemSettings.accent_color;
  const currentBorderRadius = systemSettings.border_radius;

  useEffect(() => {
    applyThemeToDOM(currentMode, currentPrimaryColor, currentBackgroundColor, currentAccentColor, currentBorderRadius);
  }, [currentMode, currentPrimaryColor, currentBackgroundColor, currentAccentColor, currentBorderRadius]);

  const toggleMode = useCallback(() => {
    const newMode = currentMode === "dark" ? "light" : "dark";
    setUserMode(newMode);
    localStorage.setItem("miyaru-theme-mode", newMode);
    if (user && allowUserTheme) {
      supabase.from("profiles").update({ theme_mode: newMode }).eq("id", user.id).then(() => {});
    }
  }, [currentMode, user, allowUserTheme]);

  const setUserPrimaryColor = useCallback((color: string) => {
    setUserPrimary(color);
    localStorage.setItem("miyaru-primary-color", color);
    if (user && allowUserTheme) {
      supabase.from("profiles").update({ custom_primary_color: color }).eq("id", user.id).then(() => {});
    }
  }, [user, allowUserTheme]);

  const setUserBackgroundColor = useCallback((color: string) => {
    setUserBg(color);
    localStorage.setItem("miyaru-bg-color", color);
    if (user && allowUserTheme) {
      supabase.from("profiles").update({ custom_background_color: color }).eq("id", user.id).then(() => {});
    }
  }, [user, allowUserTheme]);

  const resetToSystemDefaults = useCallback(() => {
    setUserMode(null);
    setUserPrimary(null);
    setUserBg(null);
    localStorage.removeItem("miyaru-theme-mode");
    localStorage.removeItem("miyaru-primary-color");
    localStorage.removeItem("miyaru-bg-color");
    if (user) {
      supabase.from("profiles").update({
        theme_mode: null, custom_primary_color: null, custom_background_color: null,
      }).eq("id", user.id).then(() => {});
    }
  }, [user]);

  const forceDarkMode = useCallback(() => {
    setUserMode("dark");
    setUserPrimary(null);
    setUserBg(null);
    localStorage.setItem("miyaru-theme-mode", "dark");
    localStorage.removeItem("miyaru-primary-color");
    localStorage.removeItem("miyaru-bg-color");
    if (user) {
      supabase.from("profiles").update({
        theme_mode: "dark", custom_primary_color: null, custom_background_color: null,
      }).eq("id", user.id).then(() => {});
    }
  }, [user]);

  const updateSystemSettings = useCallback(async (settings: Partial<SystemSettings>) => {
    const { data: existing } = await supabase.from("system_settings").select("id").limit(1).maybeSingle();
    if (existing) {
      await supabase.from("system_settings").update(settings as any).eq("id", existing.id);
    }
    setSystemSettings(prev => ({ ...prev, ...settings }));
  }, []);

  return (
    <ThemeCustomizerContext.Provider value={{
      systemSettings,
      currentMode, currentPrimaryColor, currentBackgroundColor,
      currentAccentColor, currentBorderRadius, allowUserTheme, isLoading,
      toggleMode, setUserPrimaryColor, setUserBackgroundColor,
      resetToSystemDefaults, forceDarkMode, updateSystemSettings,
      refetchSystemSettings: fetchSystemSettings,
    }}>
      {children}
    </ThemeCustomizerContext.Provider>
  );
};

export const useThemeCustomizer = () => {
  const ctx = useContext(ThemeCustomizerContext);
  if (!ctx) throw new Error("useThemeCustomizer must be used within ThemeCustomizerProvider");
  return ctx;
};
