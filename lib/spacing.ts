/** Design-system spacing scale (4px base). Prefer Tailwind space utilities. */
export const spacing = {
  0: "0px",
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
  10: "40px",
  12: "48px",
  14: "56px",
  16: "64px",
  20: "80px",
  24: "96px",
} as const;

export type SpacingKey = keyof typeof spacing;

/** Tailwind class tokens mapped to the scale (px / 4) */
export const space = {
  none: "0",
  xs: "1", // 4
  sm: "2", // 8
  md: "3", // 12
  lg: "4", // 16
  xl: "5", // 20
  "2xl": "6", // 24
  "3xl": "8", // 32
  "4xl": "10", // 40
  "5xl": "12", // 48
  "6xl": "16", // 64
} as const;
