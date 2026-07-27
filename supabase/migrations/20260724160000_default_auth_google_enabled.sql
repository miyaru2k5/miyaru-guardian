-- Default system config: Google login enabled
ALTER TABLE public.system_settings
  ALTER COLUMN auth_google_enabled SET DEFAULT true;

-- Apply to existing settings row(s)
UPDATE public.system_settings
SET auth_google_enabled = true
WHERE auth_google_enabled IS DISTINCT FROM true;

COMMENT ON COLUMN public.system_settings.auth_google_enabled IS
  'Bật/tắt nút đăng nhập bằng Google trên Login/Register (mặc định: bật)';
