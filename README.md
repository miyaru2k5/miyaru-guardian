# 🚀 Check Admin Dashboard

Admin Dashboard được xây dựng bằng **React + Vite + TypeScript + Supabase + TailwindCSS + shadcn/ui**.
Dự án dùng để quản lý hệ thống như:

* 👤 Quản lý người dùng
* ⚙️ Cài đặt hệ thống
* 🔑 Google OAuth Login
* 📊 Site Analytics
* 📄 Terms & Policy
* 📱 Facebook Contact
* 💳 Bank Accounts

---

# 🧰 Công nghệ sử dụng

* **React**
* **Vite**
* **TypeScript**
* **Supabase**
* **TailwindCSS**
* **shadcn/ui**
* **React Router**
* **Lucide Icons**

---

# 📂 Cấu trúc project

```
project-root
│
├── public
│
├── src
│   ├── components        # UI Components
│   ├── pages             # Pages
│   ├── hooks             # Custom hooks
│   ├── integrations
│   │   └── supabase      # Supabase client
│   ├── contexts
│   ├── lib
│   └── App.tsx
│
├── supabase
│   ├── functions         # Edge functions
│   ├── migrations        # Database migrations
│   └── config.toml
│
├── .env
├── package.json
└── README.md
```

---

# ⚙️ Yêu cầu hệ thống

Cài đặt trước:

* **Node.js >= 18**
* **npm hoặc pnpm**
* **Supabase CLI**

Cài Supabase CLI:

```
npm install -g supabase
```

---

# 📦 Cài đặt project

Clone repository

```
git clone <YOUR_REPOSITORY_URL>
```

Di chuyển vào project

```
cd checkadmin
```

Cài dependencies

```
npm install
```

---

# 🔐 Cấu hình Environment

Tạo file `.env`

```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

Lấy thông tin tại:

Supabase Dashboard
Project Settings → API

---

# 🗄️ Setup Database (Supabase)

Đăng nhập Supabase CLI

```
supabase login
```

Link project

```
supabase link --project-ref YOUR_PROJECT_ID
```

Push migrations

```
supabase db push
```

---

# ▶️ Chạy project

```
npm run dev
```

Server sẽ chạy tại:

```
http://localhost:8080
```

---

# 🧪 Build production

```
npm run build
```

Preview build

```
npm run preview
```

---

# 🔑 Authentication

Dự án hỗ trợ:

* Email Login
* Google OAuth Login

Cấu hình Google OAuth tại:

Supabase Dashboard → Authentication → Providers → Google

---

# 🚀 Deploy

Bạn có thể deploy bằng:

### Vercel

```
https://vercel.com
```

```

### VPS / Docker

Sau khi build:

```
npm run build
```

Deploy thư mục:

```
dist
```

---

# 📊 Supabase Features sử dụng

* Authentication
* Row Level Security (RLS)
* Postgres Database
* Storage
* Edge Functions

---

# 🛠️ Development Tips

Update browserslist database:

```
npx update-browserslist-db@latest
```

Fix vulnerabilities:

```
npm audit fix
```

---

# 📜 License

MIT License

---

# 👨‍💻 Author

Developed by **Miyaru**
