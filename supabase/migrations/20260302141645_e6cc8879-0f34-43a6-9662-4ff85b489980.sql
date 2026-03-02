
CREATE TABLE IF NOT EXISTS public.site_analytics (
  id text PRIMARY KEY DEFAULT 'global',
  total_page_views bigint NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.site_analytics (id, total_page_views)
VALUES ('global', 0)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.site_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site_analytics"
ON public.site_analytics FOR SELECT
USING (true);

CREATE OR REPLACE FUNCTION public.increment_page_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.site_analytics
  SET total_page_views = total_page_views + 1,
      updated_at = now()
  WHERE id = 'global';
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_page_views() TO anon;
GRANT EXECUTE ON FUNCTION public.increment_page_views() TO authenticated;
