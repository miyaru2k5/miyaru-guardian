-- Production hardening: products table, profile balance, topsubre cache column,
-- analytics policy cleanup. Idempotent for existing production data.

-- =====================================================
-- products
-- =====================================================
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name text NOT NULL,
  service_id text NOT NULL,
  balance bigint NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  describe text DEFAULT '',
  image_url text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_products_service_id ON public.products (service_id);
CREATE INDEX IF NOT EXISTS idx_products_visible ON public.products (is_visible);
CREATE INDEX IF NOT EXISTS idx_products_created ON public.products (created_at DESC);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
CREATE POLICY "Anyone can view products"
  ON public.products FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
CREATE POLICY "Admins can insert products"
  ON public.products FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update products" ON public.products;
CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE
  USING (public.is_admin());

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

GRANT SELECT ON TABLE public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.products TO authenticated;

-- =====================================================
-- profiles.balance (display wallet — admin-managed only)
-- =====================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS balance bigint NOT NULL DEFAULT 0;

-- =====================================================
-- system_settings.topsubre cache (jsonb service list)
-- =====================================================
ALTER TABLE public.system_settings
  ADD COLUMN IF NOT EXISTS topsubre jsonb;

-- =====================================================
-- insurance_fund banners (ensure types-aligned columns exist)
-- =====================================================
ALTER TABLE public.insurance_fund
  ADD COLUMN IF NOT EXISTS banner1 text,
  ADD COLUMN IF NOT EXISTS banner2 text,
  ADD COLUMN IF NOT EXISTS link_banner1 text,
  ADD COLUMN IF NOT EXISTS link_banner2 text,
  ADD COLUMN IF NOT EXISTS safe_trade_percentage numeric(5,2) NOT NULL DEFAULT 80.00;

-- =====================================================
-- site_analytics: single clear SELECT policy (admin only)
-- =====================================================
DROP POLICY IF EXISTS "Admins view site_analytics" ON public.site_analytics;
DROP POLICY IF EXISTS "Anyone can view site_analytics" ON public.site_analytics;

CREATE POLICY "Admins view site_analytics"
  ON public.site_analytics FOR SELECT
  USING (public.is_admin());

-- =====================================================
-- Useful indexes
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_transactions_status_created
  ON public.transactions (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_traders_status
  ON public.traders (status);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_visible
  ON public.bank_accounts (is_visible);

-- =====================================================
-- traders extended fields used by admin/public UI
-- =====================================================
ALTER TABLE public.traders
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'gdv',
  ADD COLUMN IF NOT EXISTS banner_url text,
  ADD COLUMN IF NOT EXISTS banks jsonb NOT NULL DEFAULT '[]'::jsonb;

UPDATE public.traders
SET slug = lower(regexp_replace(code, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL OR slug = '';

ALTER TABLE public.traders
  ALTER COLUMN slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_traders_slug ON public.traders (slug);
