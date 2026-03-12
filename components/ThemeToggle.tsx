"use client";

import { Moon, Sun } from "lucide-react";
import { useThemeCustomizer } from "@/contexts/ThemeCustomizerContext";

const ThemeToggle = () => {
  const { currentMode, toggleMode, allowUserTheme } = useThemeCustomizer();

  if (!allowUserTheme) return null;

  return (
    <button
      onClick={toggleMode}
      className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors border border-border"
      aria-label={currentMode === "dark" ? "Chế độ tối (bấm để chuyển sáng)" : "Chế độ sáng (bấm để chuyển tối)"}
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
