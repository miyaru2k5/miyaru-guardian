# Miyaru Guardian

Hệ thống quản lý giao dịch trung gian, giao dịch viên, ngân hàng, điều khoản và tin tức.

**Stack:** Next.js 15 · React 19 · TypeScript · Tailwind CSS · shadcn/ui · Supabase · Cloudflare R2 · Vercel

---

## Yêu cầu

- Node.js **>= 20.9** (LTS)
- npm **>= 10**
- Supabase project + migrations
- Cloudflare R2 bucket (upload ảnh admin)

---

## Cài đặt

```bash
npm install --legacy-peer-deps
cp .env.example .env
# điền giá trị thật vào .env (không commit .env)
```

### Environment

| Biến | Mô tả |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role (server-only, admin ops) |
| `R2_*` | Cloudflare R2 credentials |
| `NEXT_PUBLIC_WEBSITE_URL` | Canonical site URL |

---

## Database

```bash
# sau khi cài Supabase CLI và link project
supabase db push
```

Migration gần nhất:

- `supabase/migrations/20260724220000_drop_system_settings.sql`  
  → drop `system_settings` (cấu hình hệ thống chỉ còn trong `lib/default-theme.ts`).

---

## Chạy dev / build

```bash
npm run dev          # Next.js + Turbopack
npm run build
npm run start
npm run typecheck
npm run lint
npm test
```

App mặc định: `http://localhost:3000`

---

## Deploy

### Vercel

1. Import repo
2. Thêm env vars (không dùng Vite env)
3. Deploy framework **Next.js**

### Edge Function

Deploy `supabase/functions/create-user` (tạo user admin) với service role trên Supabase.

---

## Bảo mật (tóm tắt)

- Middleware bảo vệ `/admin/*` và `/profile` bằng session Supabase thật
- Upload/delete R2: **admin only** + rate limit
- QR download: allowlist host (chống SSRF)
- HTML sanitize isomorphic (`sanitize-html`)
- `.env` không commit — dùng `.env.example`

**Bắt buộc production:** rotate mọi secret nếu từng bị commit vào git history.

---

## Cấu trúc

```
app/                 # App Router pages + API routes
components/          # UI + admin widgets
layouts/             # Main / Admin / Auth
lib/                 # auth, supabase clients, security helpers
supabase/migrations  # Postgres schema + RLS
middleware.ts        # Auth gate + security headers
```

---

## License

MIT · Developed by Miyaru
