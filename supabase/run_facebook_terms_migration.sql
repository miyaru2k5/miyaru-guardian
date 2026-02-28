-- ============================================================
-- Chạy file này trong Supabase Dashboard > SQL Editor
-- https://supabase.com/dashboard/project/fbbfyqjaaorxrgkmvlcr/sql
-- ============================================================
-- Tables for facebook admin contact & terms pages

CREATE TABLE IF NOT EXISTS public.facebook_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  branch_name text NOT NULL,
  platform text NOT NULL,
  platform_logo_url text,
  platform_avatar_url text,
  contact_url text NOT NULL,
  support_text text,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.terms_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content text NOT NULL,
  is_published boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.facebook_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terms_pages ENABLE ROW LEVEL SECURITY;

-- PostgREST schema cache only exposes objects the current role can access.
-- Ensure anon/authenticated can SELECT, and authenticated can write (RLS still applies).
GRANT SELECT ON TABLE public.facebook_contacts TO anon, authenticated;
GRANT SELECT ON TABLE public.terms_pages TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.facebook_contacts TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.terms_pages TO authenticated;

-- Admin full access (using existing public.is_admin())
DROP POLICY IF EXISTS "Admins manage facebook_contacts" ON public.facebook_contacts;
CREATE POLICY "Admins manage facebook_contacts"
ON public.facebook_contacts
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins manage terms_pages" ON public.terms_pages;
CREATE POLICY "Admins manage terms_pages"
ON public.terms_pages
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Users can view all facebook_contacts (toàn bộ dữ liệu)
DROP POLICY IF EXISTS "Users view active facebook_contacts" ON public.facebook_contacts;
DROP POLICY IF EXISTS "Users view all facebook_contacts" ON public.facebook_contacts;
CREATE POLICY "Users view all facebook_contacts"
ON public.facebook_contacts
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users view published terms" ON public.terms_pages;
CREATE POLICY "Users view published terms"
ON public.terms_pages
FOR SELECT
USING (is_published = true);

-- updated_at trigger (reuse existing update_updated_at_column if present)
DO $$
BEGIN
  IF to_regprocedure('public.update_updated_at_column()') IS NOT NULL THEN
    DROP TRIGGER IF EXISTS update_facebook_contacts_updated_at ON public.facebook_contacts;
    CREATE TRIGGER update_facebook_contacts_updated_at
      BEFORE UPDATE ON public.facebook_contacts
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();

    DROP TRIGGER IF EXISTS update_terms_pages_updated_at ON public.terms_pages;
    CREATE TRIGGER update_terms_pages_updated_at
      BEFORE UPDATE ON public.terms_pages
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END;
$$;
