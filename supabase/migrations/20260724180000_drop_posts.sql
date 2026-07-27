-- Remove blog/posts module (admin + public)

DROP POLICY IF EXISTS "Public can read published posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can insert posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can update posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can delete posts" ON public.posts;

DROP POLICY IF EXISTS "Public can read sections for accessible posts" ON public.post_images;
DROP POLICY IF EXISTS "Admins can insert post images" ON public.post_images;
DROP POLICY IF EXISTS "Admins can update post images" ON public.post_images;
DROP POLICY IF EXISTS "Admins can delete post images" ON public.post_images;

DROP INDEX IF EXISTS public.idx_posts_slug;
DROP INDEX IF EXISTS public.idx_posts_created;
DROP INDEX IF EXISTS public.idx_posts_category;
DROP INDEX IF EXISTS public.idx_posts_tags;
DROP INDEX IF EXISTS public.idx_post_images_post_id;

DROP TABLE IF EXISTS public.post_images CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
