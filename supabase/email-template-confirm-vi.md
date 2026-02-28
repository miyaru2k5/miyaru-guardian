# Mẫu email xác minh - Tiếng Việt

Vào **Supabase Dashboard** → **Authentication** → **Email Templates** → **Confirm signup**

## Subject (Tiêu đề):

```
Xác minh email - Miyaru Guardian
```

## Body (Nội dung HTML):

```html
<h2>Xác nhận đăng ký</h2>
<p>Cảm ơn bạn đã đăng ký ứng dụng Miyaru Guardian!</p>
<p>Vui lòng xác minh email của bạn ({{ .Email }}) bằng cách bấm nút bên dưới:</p>
<p><a href="{{ .ConfirmationURL }}" style="display:inline-block; padding:12px 24px; background-color:#ec4899; color:white; text-decoration:none; border-radius:8px; font-weight:bold;">Xác minh email</a></p>
<p>Nếu bạn không đăng ký tài khoản này, hãy bỏ qua email này.</p>
```

## Cấu hình Redirect URL

Vào **Authentication** → **URL Configuration** → **Redirect URLs**, thêm:

- `http://localhost:8080/auth/confirm` (cho dev)
- `https://your-domain.com/auth/confirm` (cho production)

Sau khi lưu, link "Xác minh email" sẽ redirect về trang `/auth/confirm`, xử lý session và chuyển user vào trang chủ hoặc admin.
