# Changelog

## [1.1.0] — 2026-07-24 — Feature removals

### Removed modules

- User: `/bankings`, `/tang-tuong-tac`, `/bai-viet`, `/tin-tuc`, `/dich-vu`, `/contact-facebook`
- Admin: `/admin/banks`, `/admin/insurance`, `/admin/facebook`, `/admin/transactions`, `/admin/posts`, `/admin/products`
- APIs: `/api/download-qr`, `/api/tang-tuong-tac`
- DB: `bank_accounts`, `insurance_fund`, `facebook_contacts`, `transactions`, `posts`, `products`, `system_settings` (full table)
- Kept: `traders.insurance_fund`, `traders.facebook` (per-GDV fields); tools `/get-uid-fb`, `/get-2fa`

### Migrations

- `20260724200000_drop_banks_insurance_topsubre.sql`
- `20260724210000_drop_facebook_contacts.sql`
- `20260724220000_drop_system_settings.sql`

---

## [1.0.0] — 2026-07-24 — Production hardening

### Package upgrades

| Package | Old | New | Reason |
|---|---|---|---|
| next | 14.2.5 | 15.5.21 | Latest stable App Router, middleware, metadata |
| react / react-dom | 18.3.1 | 19.2.8 | Latest stable React |
| @supabase/supabase-js | 2.97 | 2.110+ | Latest client + types |
| @supabase/ssr | — | 0.12.3 | Cookie-based SSR auth |
| sanitize-html | — | 2.17+ | Isomorphic XSS sanitization |
| framer-motion | 11.x | 12.x | React 19 support |
| react-day-picker | 8.x | 9.x | React 19 peer compatibility |
| vaul | 0.9 | 1.1 | React 19 peer compatibility |
| eslint / eslint-config-next | 8 / 14 | 9 / 15 | Match Next 15 |
| TypeScript | 5.8 | 5.8+ | Strict mode enabled |
| vitest | present | configured | Security unit tests |

> Prisma **not** added — project uses Supabase/Postgres, not Prisma ORM.

### Breaking / migration

1. **Auth cookies:** Client uses `@supabase/ssr` `createBrowserClient` (cookie session). Middleware validates real Supabase JWT, not forgeable `miyaru-session=1`.
2. **Upload/delete APIs require admin session.**
3. **`.env` removed from git tracking** — use `.env.example`.
4. **DB migration required:**  
   `supabase/migrations/20260724120000_products_balance_topsubre_security.sql`
5. **Env:** `SUPABASE_SERVICE_ROLE_KEY` recommended for topsubre cache writes; `LIKENHANH_API_KEY` required (no hardcoded fallback).
6. **Next 15:** dynamic `params` are `Promise` (updated server pages).

### Security fixes

- Unauthenticated R2 upload/delete → admin-only + rate limit
- SSRF `/api/download-qr` → HTTPS + host allowlist
- Hardcoded LIKENHANH key removed
- Secrets: `.env` gitignored + example file
- Middleware: real session + admin RPC gate
- HTML sanitize works on server (terms pages)
- Security headers (HSTS, XFO, nosniff, Referrer-Policy)
- R2 delete path traversal / foreign host rejection

### Features / quality

- Dynamic `app/sitemap.ts` + `app/robots.ts`
- `app/error.tsx` error boundary
- Admin menu link for Transactions
- Types aligned: products, balance, topsubre, traders.slug/role/banks, insurance banners
- Unit tests for url-safety, r2-helpers, sanitizeHtml
- README rewritten for Next.js stack

### How to run

```bash
npm install --legacy-peer-deps
cp .env.example .env   # fill secrets
supabase db push       # apply migrations
npm run dev
npm run build && npm test && npm run typecheck
```

### Rotate secrets (mandatory if repo was public)

Rotate R2 keys, LIKENHANH API key, and review Supabase keys that may have been committed historically.
