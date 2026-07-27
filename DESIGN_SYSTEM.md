# Miyaru Design System

Unified tokens + Tailwind theme for all screens.

## Tokens

| Layer | Location |
|---|---|
| **Brand defaults (code)** | `lib/default-theme.ts` |
| CSS variables | `styles/design-tokens.css` |
| Global styles | `app/globals.css` |
| Tailwind theme | `tailwind.config.ts` |
| TS helpers | `lib/theme.ts`, `lib/spacing.ts`, `lib/radius.ts`, `lib/shadow.ts`, `lib/colors.ts` |

## Brand palette (defaults in code)

| Token | Hex |
|---|---|
| Primary | `#F97316` |
| Hover | `#EA580C` |
| Background | `#F8FAFC` |
| Card | `#FFFFFF` |
| Text | `#0F172A` |
| Text phụ | `#475569` |
| Border | `#E2E8F0` |
| Success | `#22C55E` |
| Warning | `#F59E0B` |
| Error | `#EF4444` |
| Info | `#3B82F6` |

Do **not** edit these via `/admin/settings` — change `lib/default-theme.ts` then CSS tokens stay in sync via `ThemeCustomizerProvider` + `design-tokens.css`.

## Spacing (4px)

`0 · 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 56 · 64 · 80 · 96`

Prefer: `gap-*`, `space-y-*`, `p-*`, `px-*`, `py-*`. Avoid arbitrary margins.

## Radius

**Default control radius: 10px** (`--radius` / `--radius-lg` / `rounded-lg`).

| Token | Value | Class | Use |
|---|---|---|---|
| xs | 4px | `rounded-xs` | tiny chips |
| sm | 6px | `rounded-sm` | checkbox / menu item |
| md | 8px | `rounded-md` | small |
| **lg** | **10px** | **`rounded-lg`** | **input, button, select, combobox, card** |
| xl | 12px | `rounded-xl` | larger panels |
| 2xl | 14px | `rounded-2xl` | rare |
| 3xl | 16px | `rounded-3xl` | rare |
| pill | 9999px | `rounded-full` | avatars, badges |

Source: `lib/default-theme.ts` (`borderRadius: "10px"`) + `styles/design-tokens.css` + `lib/radius.ts`.

## Colors (semantic)

`background · foreground · card · primary · secondary · muted · accent · destructive · success · warning · info · border · input · ring · sidebar`

Use: `bg-primary`, `text-muted-foreground`, `border-border` — never hardcode hex/hsl in components.

## Controls

- Height: `h-control` (40), `h-control-sm` (36), `h-control-lg` (44)
- Buttons / inputs / selects share radius-lg + focus ring

## Layout helpers

- `.ds-page` — container page padding
- `.ds-section` — vertical stack gap-6
- `.ds-stack` / `.ds-stack-sm` / `.ds-stack-lg`
- `.ds-page-header` / `.ds-page-title` / `.ds-page-desc`
- `<PageHeader />` component

## Motion

`duration-fast | normal | slow | slower`  
`ease-standard | out | in | spring`
