/**
 * Semantic color tokens (CSS variable channel names).
 * Use Tailwind: bg-primary, text-muted-foreground, border-border, etc.
 */
export const colorTokens = {
  background: "background",
  foreground: "foreground",
  card: "card",
  cardForeground: "card-foreground",
  popover: "popover",
  popoverForeground: "popover-foreground",
  primary: "primary",
  primaryHover: "primary-hover",
  primaryForeground: "primary-foreground",
  secondary: "secondary",
  secondaryForeground: "secondary-foreground",
  muted: "muted",
  mutedForeground: "muted-foreground",
  accent: "accent",
  accentForeground: "accent-foreground",
  destructive: "destructive",
  destructiveForeground: "destructive-foreground",
  success: "success",
  successForeground: "success-foreground",
  warning: "warning",
  warningForeground: "warning-foreground",
  info: "info",
  infoForeground: "info-foreground",
  border: "border",
  input: "input",
  ring: "ring",
  sidebar: "sidebar",
  sidebarForeground: "sidebar-foreground",
  sidebarBorder: "sidebar-border",
} as const;

export type ColorToken = (typeof colorTokens)[keyof typeof colorTokens];

export function hslToken(token: string): string {
  return `hsl(var(--${token}))`;
}
