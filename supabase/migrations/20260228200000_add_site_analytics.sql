-- Site analytics for page view tracking (single row)

CREATE TABLE IF NOT EXISTS public.site_analytics (
  id text PRIMARY KEY DEFAULT 'global',
  total_page_views bigint NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.site_analytics (id, total_page_views)
VALUES ('global', 0)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.site_analytics ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON TABLE public.site_analytics TO authenticated;

-- Only admins can read (RLS)
CREATE POLICY "Admins view site_analytics"
ON public.site_analytics FOR SELECT
USING (public.is_admin());

-- RPC to increment (callable by anon for public page visits)
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

-- Allow anon to call increment (for public page visits)
GRANT EXECUTE ON FUNCTION public.increment_page_views() TO anon;
GRANT EXECUTE ON FUNCTION public.increment_page_views() TO authenticated;
