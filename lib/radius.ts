/** Design-system border radius tokens — control default is 10px */
export const radius = {
  xs: "4px",
  sm: "6px",
  md: "8px",
  /** Default for inputs, buttons, selects, combobox */
  lg: "10px",
  xl: "12px",
  "2xl": "14px",
  "3xl": "16px",
  pill: "9999px",
  /** Alias of control default */
  control: "10px",
  DEFAULT: "10px",
} as const;

export type RadiusKey = keyof typeof radius;

/** Tailwind class names for radius */
export const radiusClass = {
  xs: "rounded-xs",
  sm: "rounded-sm",
  md: "rounded-md",
  /** Prefer this for form controls */
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  "3xl": "rounded-3xl",
  pill: "rounded-full",
  control: "rounded-lg",
  DEFAULT: "rounded",
} as const;
