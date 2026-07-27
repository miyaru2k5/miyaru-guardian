-- System config lives in code (lib/default-theme.ts). Drop DB table.

DROP POLICY IF EXISTS "Anyone can view system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admins can update system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admins can manage system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Public can read system_settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admins manage system_settings" ON public.system_settings;

DROP TRIGGER IF EXISTS update_system_settings_updated_at ON public.system_settings;

DROP TABLE IF EXISTS public.system_settings CASCADE;
