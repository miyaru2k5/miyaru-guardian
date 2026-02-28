-- Cấu hình đăng nhập Google lưu vào system_settings
-- Client ID có thể lưu (public); Client Secret cấu hình tại Supabase Dashboard > Auth > Providers > Google
ALTER TABLE public.system_settings
  ADD COLUMN IF NOT EXISTS auth_google_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS auth_google_client_id text;

COMMENT ON COLUMN public.system_settings.auth_google_enabled IS 'Bật/tắt nút đăng nhập bằng Google trên Login/Register';
COMMENT ON COLUMN public.system_settings.auth_google_client_id IS 'Google OAuth Client ID (tham chiếu; cấu hình đầy đủ tại Supabase Dashboard > Auth > Providers > Google)';
