-- Remove facebook contacts admin/public module

DROP POLICY IF EXISTS "Admins manage facebook_contacts" ON public.facebook_contacts;
DROP POLICY IF EXISTS "Users view active facebook_contacts" ON public.facebook_contacts;
DROP POLICY IF EXISTS "Users view all facebook_contacts" ON public.facebook_contacts;

DROP TRIGGER IF EXISTS update_facebook_contacts_updated_at ON public.facebook_contacts;

DROP TABLE IF EXISTS public.facebook_contacts CASCADE;
