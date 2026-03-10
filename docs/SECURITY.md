# Cấu hình bảo mật Admin Guardian

## Mật khẩu & bảng Profiles

**Quan trọng:** Mật khẩu **không** lưu trong bảng `profiles`. Supabase Auth lưu mật khẩu (đã hash bcrypt) trong `auth.users`. Bảng `profiles` chỉ chứa thông tin mở rộng: full_name, email, avatar_url, theme_mode, v.v.

- Login/Register dùng `supabase.auth.signInWithPassword` và `supabase.auth.signUp`
- Khi đăng ký: `handle_new_user` trigger tự tạo profile từ `auth.users`
- Không thêm cột `password` vào `profiles` – vi phạm bảo mật và trùng lặp dữ liệu

## Leaked Password Protection (Supabase)

**Cảnh báo: Leaked Password Protection Disabled** – Tính năng này cần được bật trong Supabase Dashboard.

### Cách bật Leaked Password Protection

1. Đăng nhập [Supabase Dashboard](https://supabase.com/dashboard)
2. Chọn project của bạn
3. Vào **Authentication** → **Providers** → **Email**
4. Bật **Leaked password protection**

> **Lưu ý:** Tính năng này có sẵn trên **Pro Plan** trở lên. Supabase dùng [HaveIBeenPwned.org Pwned Passwords API](https://haveibeenpwned.com/Passwords) để chặn mật khẩu đã bị rò rỉ.

### Khuyến nghị thêm

- **Độ dài tối thiểu:** 8 ký tự trở lên
- **Ký tự bắt buộc:** Chữ in hoa, chữ thường, số và ký hiệu (`!@#$%^&*()_+-=[]{};':"|<>?,./`)
- **MFA:** Bật xác thực hai yếu tố cho tài khoản admin
