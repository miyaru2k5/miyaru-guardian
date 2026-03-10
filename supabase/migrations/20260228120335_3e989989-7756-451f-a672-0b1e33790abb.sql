
-- Add branding columns to system_settings
ALTER TABLE public.system_settings 
  ADD COLUMN IF NOT EXISTS site_name text NOT NULL DEFAULT 'Admin',
  ADD COLUMN IF NOT EXISTS logo_url text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS footer_data jsonb NOT NULL DEFAULT '{"brand_name":"Admin","description":"Chi phí thấp – Nhanh chóng – Chất lượng.","services":["Giao dịch trung gian","Giao dịch viên"],"contact":{"phone":"0357.175.172","email":"contact@Admin.vn"},"copyright":"© 2026 Admin Team."}'::jsonb;

-- Add social links to traders
ALTER TABLE public.traders
  ADD COLUMN IF NOT EXISTS facebook text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS zalo text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS website text DEFAULT NULL;

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update categories" ON public.categories FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete categories" ON public.categories FOR DELETE USING (is_admin());

-- Trader-categories junction
CREATE TABLE IF NOT EXISTS public.trader_categories (
  trader_id uuid NOT NULL REFERENCES public.traders(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (trader_id, category_id)
);

ALTER TABLE public.trader_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view trader_categories" ON public.trader_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage trader_categories" ON public.trader_categories FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can delete trader_categories" ON public.trader_categories FOR DELETE USING (is_admin());
