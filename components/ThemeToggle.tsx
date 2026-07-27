"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useThemeCustomizer } from "@/contexts/ThemeCustomizerContext";

const emptySubscribe = () => () => {};

const ThemeToggle = () => {
  const { currentMode, toggleMode, allowUserTheme } = useThemeCustomizer();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!allowUserTheme || !mounted) return null;

  return (
    <button
      type="button"
      onClick={toggleMode}
      className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors border border-border"
      aria-label={
        currentMode === "dark"
          ? "Chế độ tối (bấm để chuyển sáng)"
          : "Chế độ sáng (bấm để chuyển tối)"
      }
    >
      {currentMode === "dark" ? (
        <Moon size={20} className="text-primary" />
      ) : (
        <Sun size={20} className="text-primary" />
      )}
    </button>
  );
};

export default ThemeToggle;
