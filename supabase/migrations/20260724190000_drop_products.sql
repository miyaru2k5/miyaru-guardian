-- Remove products / public dich-vu module

DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;

DROP INDEX IF EXISTS public.idx_products_service_id;
DROP INDEX IF EXISTS public.idx_products_visible;
DROP INDEX IF EXISTS public.idx_products_created;

DROP TABLE IF EXISTS public.products CASCADE;
