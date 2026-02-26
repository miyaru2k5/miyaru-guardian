
-- Create system_settings table (single record)
CREATE TABLE public.system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  default_mode text NOT NULL DEFAULT 'dark',
  primary_color text NOT NULL DEFAULT '330 100% 55%',
  background_color text NOT NULL DEFAULT '240 10% 4%',
  accent_color text NOT NULL DEFAULT '330 100% 55%',
  border_radius text NOT NULL DEFAULT '0.75rem',
  allow_user_theme boolean NOT NULL DEFAULT true,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Anyone can view system settings"
ON public.system_settings FOR SELECT
USING (true);

-- Only admin can update
CREATE POLICY "Admins can update system settings"
ON public.system_settings FOR UPDATE
USING (public.is_admin());

-- Only admin can insert
CREATE POLICY "Admins can insert system settings"
ON public.system_settings FOR INSERT
WITH CHECK (public.is_admin());

-- Insert default row
INSERT INTO public.system_settings (id) VALUES (gen_random_uuid());

-- Add theme columns to profiles
ALTER TABLE public.profiles
ADD COLUMN theme_mode text DEFAULT NULL,
ADD COLUMN custom_primary_color text DEFAULT NULL,
ADD COLUMN custom_background_color text DEFAULT NULL;

-- Trigger for updated_at on system_settings
CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
