"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import {
  defaultThemeConfig,
  applyDefaultPaletteToRoot,
  hexToHsl,
  hslToHex,
  type ThemeMode,
} from "@/lib/default-theme";

export { hexToHsl, hslToHex };

/** System config — always from code (`lib/default-theme`), never from DB */
export interface SystemSettings {
  default_mode: string;
  primary_color: string;
  background_color: string;
  accent_color: string;
  border_radius: string;
  allow_user_theme: boolean;
  site_name: string;
  logo_url: string | null;
  auth_google_enabled: boolean;
  auth_google_client_id: string | null;
}

interface ThemeCustomizerContextType {
  systemSettings: SystemSettings;
  currentMode: ThemeMode;
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
  /** No-op kept for API compatibility — system config is code-only */
  updateSystemSettings: (settings: Partial<SystemSettings>) => Promise<void>;
  refetchSystemSettings: () => Promise<void>;
}

function buildCodeSettings(): SystemSettings {
  const s = defaultThemeConfig.system;
  return {
    default_mode: s.default_mode,
    primary_color: s.primary_color,
    background_color: s.background_color,
    accent_color: s.accent_color,
    border_radius: s.border_radius,
    allow_user_theme: s.allow_user_theme,
    site_name: s.site_name,
    logo_url: s.logo_url,
    auth_google_enabled: s.auth_google_enabled,
    auth_google_client_id: s.auth_google_client_id,
  };
}

const CODE_SETTINGS = buildCodeSettings();

const ThemeCustomizerContext = createContext<ThemeCustomizerContextType | undefined>(
  undefined
);

function applyThemeToDOM(
  mode: ThemeMode,
  primary: string,
  accent: string,
  radius: string
) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(mode);
  root.setAttribute("data-theme", mode);

  applyDefaultPaletteToRoot(root, mode, {
    primaryOverride: primary,
    accentOverride: accent,
  });

  root.style.setProperty("--radius", radius);
  root.style.setProperty("--radius-lg", radius);
}

function getInitialThemeFromStorage() {
  if (typeof window === "undefined") {
    return {
      mode: null as string | null,
      primary: null as string | null,
      bg: null as string | null,
    };
  }
  return {
    mode: localStorage.getItem("miyaru-theme-mode"),
    primary: localStorage.getItem("miyaru-primary-color"),
    bg: localStorage.getItem("miyaru-bg-color"),
  };
}

export const ThemeCustomizerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuth();
  /** Immutable code defaults — never loaded from / written to DB */
  const systemSettings = useMemo(() => CODE_SETTINGS, []);

  const [userMode, setUserMode] = useState<string | null>(
    () => getInitialThemeFromStorage().mode
  );
  const [userPrimary, setUserPrimary] = useState<string | null>(
    () => getInitialThemeFromStorage().primary
  );
  const [userBg, setUserBg] = useState<string | null>(
    () => getInitialThemeFromStorage().bg
  );
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserTheme = useCallback(async () => {
    if (!user) {
      setUserMode(localStorage.getItem("miyaru-theme-mode"));
      setUserPrimary(localStorage.getItem("miyaru-primary-color"));
      setUserBg(localStorage.getItem("miyaru-bg-color"));
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("theme_mode, custom_primary_color, custom_background_color")
      .eq("id", user.id)
      .maybeSingle();
    if (data) {
      setUserMode(data.theme_mode ?? localStorage.getItem("miyaru-theme-mode"));
      setUserPrimary(
        data.custom_primary_color ?? localStorage.getItem("miyaru-primary-color")
      );
      setUserBg(
        data.custom_background_color ?? localStorage.getItem("miyaru-bg-color")
      );
    }
  }, [user]);

  useEffect(() => {
    void fetchUserTheme().finally(() => setIsLoading(false));
  }, [fetchUserTheme]);

  const allowUserTheme = systemSettings.allow_user_theme;
  const systemDefault =
    systemSettings.default_mode === "dark" ? "dark" : "light";
  const currentMode = ((allowUserTheme && userMode) || systemDefault) as ThemeMode;
  const currentPrimaryColor =
    (allowUserTheme && userPrimary) || systemSettings.primary_color;
  const currentBackgroundColor =
    (allowUserTheme && userBg) || systemSettings.background_color;
  const currentAccentColor = systemSettings.accent_color;
  const currentBorderRadius = systemSettings.border_radius;

  useEffect(() => {
    applyThemeToDOM(
      currentMode,
      currentPrimaryColor,
      currentAccentColor,
      currentBorderRadius
    );
  }, [
    currentMode,
    currentPrimaryColor,
    currentBackgroundColor,
    currentAccentColor,
    currentBorderRadius,
  ]);

  const toggleMode = useCallback(() => {
    const newMode = currentMode === "dark" ? "light" : "dark";
    setUserMode(newMode);
    localStorage.setItem("miyaru-theme-mode", newMode);
    if (user && allowUserTheme) {
      supabase
        .from("profiles")
        .update({ theme_mode: newMode })
        .eq("id", user.id)
        .then(() => {});
    }
  }, [currentMode, user, allowUserTheme]);

  const setUserPrimaryColor = useCallback(
    (color: string) => {
      setUserPrimary(color);
      localStorage.setItem("miyaru-primary-color", color);
      if (user && allowUserTheme) {
        supabase
          .from("profiles")
          .update({ custom_primary_color: color })
          .eq("id", user.id)
          .then(() => {});
      }
    },
    [user, allowUserTheme]
  );

  const setUserBackgroundColor = useCallback(
    (color: string) => {
      setUserBg(color);
      localStorage.setItem("miyaru-bg-color", color);
      if (user && allowUserTheme) {
        supabase
          .from("profiles")
          .update({ custom_background_color: color })
          .eq("id", user.id)
          .then(() => {});
      }
    },
    [user, allowUserTheme]
  );

  const resetToSystemDefaults = useCallback(() => {
    setUserMode(null);
    setUserPrimary(null);
    setUserBg(null);
    localStorage.removeItem("miyaru-theme-mode");
    localStorage.removeItem("miyaru-primary-color");
    localStorage.removeItem("miyaru-bg-color");
    if (user) {
      supabase
        .from("profiles")
        .update({
          theme_mode: null,
          custom_primary_color: null,
          custom_background_color: null,
        })
        .eq("id", user.id)
        .then(() => {});
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
      supabase
        .from("profiles")
        .update({
          theme_mode: "dark",
          custom_primary_color: null,
          custom_background_color: null,
        })
        .eq("id", user.id)
        .then(() => {});
    }
  }, [user]);

  const updateSystemSettings = useCallback(async (_settings: Partial<SystemSettings>) => {
    // System config is code-only (`lib/default-theme.ts`). Intentionally no-op.
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[theme] updateSystemSettings ignored — edit lib/default-theme.ts instead"
      );
    }
  }, []);

  const refetchSystemSettings = useCallback(async () => {
    // No remote system_settings table
  }, []);

  return (
    <ThemeCustomizerContext.Provider
      value={{
        systemSettings,
        currentMode,
        currentPrimaryColor,
        currentBackgroundColor,
        currentAccentColor,
        currentBorderRadius,
        allowUserTheme,
        isLoading,
        toggleMode,
        setUserPrimaryColor,
        setUserBackgroundColor,
        resetToSystemDefaults,
        forceDarkMode,
        updateSystemSettings,
        refetchSystemSettings,
      }}
    >
      {children}
    </ThemeCustomizerContext.Provider>
  );
};

export const useThemeCustomizer = () => {
  const ctx = useContext(ThemeCustomizerContext);
  if (!ctx) {
    throw new Error("useThemeCustomizer must be used within ThemeCustomizerProvider");
  }
  return ctx;
};
