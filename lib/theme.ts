import { spacing } from "@/lib/spacing";
import { radius } from "@/lib/radius";
import { shadow } from "@/lib/shadow";
import { colorTokens } from "@/lib/colors";
import { defaultThemeConfig, defaultPaletteHex } from "@/lib/default-theme";

/** Aggregated design system reference for TypeScript consumers */
export const theme = {
  spacing,
  radius,
  shadow,
  /** Semantic token names (CSS vars) */
  colors: colorTokens,
  /** Brand defaults from code (lib/default-theme) */
  defaults: defaultThemeConfig,
  palette: defaultPaletteHex,
  motion: {
    duration: {
      fast: "var(--duration-fast)",
      normal: "var(--duration-normal)",
      slow: "var(--duration-slow)",
      slower: "var(--duration-slower)",
    },
    ease: {
      standard: "var(--ease-standard)",
      out: "var(--ease-out)",
      in: "var(--ease-in)",
      spring: "var(--ease-spring)",
    },
  },
  zIndex: {
    base: "var(--z-base)",
    dropdown: "var(--z-dropdown)",
    sticky: "var(--z-sticky)",
    overlay: "var(--z-overlay)",
    modal: "var(--z-modal)",
    toast: "var(--z-toast)",
    tooltip: "var(--z-tooltip)",
    max: "var(--z-max)",
  },
  control: {
    height: {
      sm: "var(--control-h-sm)",
      md: "var(--control-h-md)",
      lg: "var(--control-h-lg)",
    },
  },
  icon: {
    xs: "var(--icon-xs)",
    sm: "var(--icon-sm)",
    md: "var(--icon-md)",
    lg: "var(--icon-lg)",
  },
} as const;

export type Theme = typeof theme;
