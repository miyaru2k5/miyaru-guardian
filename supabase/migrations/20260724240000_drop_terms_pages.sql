-- Remove terms module (admin + public)

DROP POLICY IF EXISTS "Admins manage terms_pages" ON public.terms_pages;
DROP POLICY IF EXISTS "Users view published terms" ON public.terms_pages;
DROP POLICY IF EXISTS "Anyone can view published terms" ON public.terms_pages;

DROP TRIGGER IF EXISTS update_terms_pages_updated_at ON public.terms_pages;

DROP TABLE IF EXISTS public.terms_pages CASCADE;
