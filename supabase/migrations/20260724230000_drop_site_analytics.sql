-- Remove page-view / web traffic analytics module

DROP POLICY IF EXISTS "Admins view site_analytics" ON public.site_analytics;
DROP POLICY IF EXISTS "Anyone can view site_analytics" ON public.site_analytics;

DROP FUNCTION IF EXISTS public.increment_page_views() CASCADE;

DROP TABLE IF EXISTS public.site_analytics CASCADE;
