# Miyaru Guardian

Hệ thống kiểm tra uy tín & tố cáo lừa đảo cho cộng đồng mua bán online tại Việt Nam.

## 🚀 Tính năng chính

- ✅ **Kiểm tra uy tín GDV** (Giao Dịch Viên) - Tìm kiếm và đánh giá độ tin cậy
- ✅ **Tố cáo & tìm kiếm lừa đảo** - Hệ thống báo cáo scam với index tìm kiếm
- ✅ **Tin tức & cảnh báo cộng đồng** - Bài viết và thông báo quan trọng
- ✅ **Hệ thống bảo hiểm giao dịch** - Theo dõi và quản lý quỹ bảo hiểm
- ✅ **Quản lý Admin Dashboard** - Giao diện quản trị toàn diện
- ✅ **Liên hệ Facebook** - Quản lý thông tin liên hệ qua Facebook
- ✅ **Điều khoản & chính sách** - Hệ thống quản lý trang điều khoản
- ✅ **Theo dõi thống kê** - Analytics và thống kê truy cập
- ✅ **Banner quảng cáo** - Hệ thống banner đa vị trí

## 🛠️ Công nghệ sử dụng

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18 + Tailwind CSS + shadcn/ui
- **State Management**: React Query + Context API
- **Forms**: React Hook Form + Zod validation
- **Animations**: Framer Motion
- **Charts**: Recharts

### Backend & Database
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Google OAuth + Email)
- **Storage**: Cloudflare R2 (cho hình ảnh và file)
- **API**: Next.js API Routes + Server Actions

### DevOps & Deployment
- **Hosting**: Vercel
- **Database Hosting**: Supabase Cloud
- **CDN**: Cloudflare
- **Testing**: Vitest + React Testing Library

## ☁️ Kiến trúc Cloud

Dự án sử dụng kiến trúc cloud-native với các dịch vụ:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel        │    │   Supabase      │    │  Cloudflare R2  │
│   (Frontend)    │◄──►│   (Database)    │    │   (Storage)     │
│                 │    │                 │    │                 │
│ - Next.js App   │    │ - PostgreSQL    │    │ - Images        │
│ - API Routes    │    │ - Auth          │    │ - Files         │
│ - Server Actions│    │ - Realtime      │    │ - CDN           │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📋 Cấu hình dự án

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Cấu hình Environment Variables

Tạo file `.env.local` với các biến môi trường:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Cloudflare R2 Storage
R2_ACCOUNT_ID=your_r2_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=your_bucket_name
R2_ENDPOINT=https://your_account_id.r2.cloudflarestorage.com
R2_PUBLIC_URL=https://your_public_domain.r2.dev
NEXT_PUBLIC_R2_DOMAIN=your_public_domain.r2.dev

# Website
NEXT_PUBLIC_WEBSITE_URL=https://your-domain.com
```

### 3. Cấu hình Supabase

1. Tạo project mới tại [supabase.com](https://supabase.com)
2. Lấy thông tin kết nối từ Project Settings > API
3. Chạy migrations theo hướng dẫn bên dưới

### 4. Cấu hình Cloudflare R2

1. Tạo R2 bucket tại [dash.cloudflare.com](https://dash.cloudflare.com)
2. Tạo API tokens với quyền R2
3. Cấu hình public domain cho bucket

### 5. Chạy migrations

```bash
# Cài đặt Supabase CLI
npm install -g supabase

# Login vào Supabase
supabase login

# Link project
supabase link --project-ref your_project_id

# Chạy tất cả migrations
supabase db push
```

### 6. Khởi chạy development server

```bash
npm run dev
```

## 🗄️ Cấu trúc Database

### Tables chính

| Table | Mô tả | Quyền truy cập |
|-------|--------|----------------|
| `profiles` | Thông tin hồ sơ người dùng | User (own), Admin (full) |
| `user_roles` | Vai trò người dùng (admin/user) | Admin only |
| `traders` | Thông tin giao dịch viên (GDV) | Public read, Admin write |
| `scam_reports` | Báo cáo lừa đảo | Public read, Admin write |
| `scam_search_index` | Index tìm kiếm cho báo cáo | Public read, System write |
| `posts` | Tin tức, cảnh báo | Public read, Admin write |
| `comments` | Bình luận của người dùng | User (own), Admin (full) |
| `banners` | Banner quảng cáo (vị trí 1-4) | Public read, Admin write |
| `bank_accounts` | Tài khoản ngân hàng | Public read, Admin write |
| `transactions` | Giao dịch bảo hiểm | User (own), Admin (full) |
| `insurance_fund` | Quỹ bảo hiểm | Admin only |
| `facebook_contacts` | Thông tin liên hệ Facebook | Public read, Admin write |
| `terms_pages` | Trang điều khoản & chính sách | Public read, Admin write |
| `site_analytics` | Thống kê truy cập | Admin only |

### Database Functions

```sql
-- Kiểm tra vai trò người dùng
has_role(user_id uuid, role text) → boolean

-- Kiểm tra quyền admin
is_admin(user_id uuid) → boolean

-- Tự động cập nhật timestamp
update_updated_at_column() → trigger

-- Tự động tạo profile khi đăng ký
handle_new_user() → trigger

-- Theo dõi lượt truy cập
increment_page_views(page_path text) → void
```

### RLS Policies

- **Public read**: `traders`, `scam_reports`, `posts`, `banners`, `bank_accounts`, `facebook_contacts`, `terms_pages`
- **User own data**: `profiles`, `comments`, `transactions`
- **Admin only**: `user_roles`, `insurance_fund`, `site_analytics`

## 🔐 Authentication & Authorization

### Authentication Methods
- Email/Password
- Google OAuth

### User Roles
- **user**: Người dùng thông thường
- **admin**: Quản trị viên với toàn quyền

### Permission System
```typescript
// Kiểm tra quyền admin
const isAdmin = await is_admin(user_id);

// Kiểm tra vai trò cụ thể
const hasRole = await has_role(user_id, 'admin');
```

## 📁 Cấu trúc thư mục

```
miyaru-guardian/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── check-uy-tin/      # Kiểm tra uy tín
│   ├── scamer/            # Trang lừa đảo
│   ├── to-cao-scam/       # Tố cáo scam
│   └── ...
├── components/            # React components
│   ├── admin/            # Admin components
│   ├── check-uy-tin/     # Uy tín components
│   ├── ui/               # UI components (shadcn)
│   └── ...
├── contexts/              # React Contexts
├── hooks/                 # Custom hooks
├── layouts/               # Layout components
├── lib/                   # Utility libraries
│   ├── auth.tsx          # Authentication logic
│   ├── supabase.ts       # Supabase client
│   ├── r2.ts             # Cloudflare R2 client
│   └── ...
├── supabase/              # Supabase config
│   ├── migrations/       # Database migrations
│   └── functions/        # Edge functions
├── types/                 # TypeScript types
└── utils/                 # Utility functions
```

## 🚀 Deployment

### Deploy lên Vercel

1. Connect GitHub repository với Vercel
2. Cấu hình environment variables trên Vercel
3. Deploy tự động khi push code

```bash
# Hoặc deploy manual
npm install -g vercel
vercel --prod
```

### Database Migrations

Trước khi deploy, đảm bảo đã chạy tất cả migrations trên Supabase:

```bash
supabase db push
```

## 🧪 Testing

```bash
# Chạy tests
npm run test

# Chạy tests trong watch mode
npm run test:watch
```

## 📊 Monitoring & Analytics

- **Page Analytics**: Theo dõi lượt truy cập qua `site_analytics` table
- **Error Tracking**: Logs trên Vercel và Supabase
- **Performance**: Vercel Analytics

## 🔧 Maintenance

### Backup Database
Supabase tự động backup hàng ngày. Để backup thủ công:

```bash
supabase db dump -f backup.sql
```

### Update Dependencies
```bash
npm update
```

### Monitor Logs
- Vercel: Dashboard > Functions > Logs
- Supabase: Dashboard > Logs

## 📝 License

MIT

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Liên hệ

- **Website**: [admin.miyaru.online](https://admin.miyaru.online)
- **Email**: support@miyaru.online

## 🔗 Links hữu ích

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Cloudflare Dashboard](https://dash.cloudflare.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)