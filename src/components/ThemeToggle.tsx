import { Moon, Sun } from "lucide-react";
import { useThemeCustomizer } from "@/contexts/ThemeCustomizerContext";

const ThemeToggle = () => {
  const { currentMode, toggleMode, allowUserTheme } = useThemeCustomizer();

  if (!allowUserTheme) return null;

  return (
    <button
      onClick={toggleMode}
      className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
      aria-label={currentMode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {currentMode === "dark" ? (
        <Sun size={20} className="text-primary" />
      ) : (
        <Moon size={20} className="text-primary" />
      )}
    </button>
  );
};

export default ThemeToggle;
