-- Enable row level security on posts and post images
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_images ENABLE ROW LEVEL SECURITY;

-- Posts policies
CREATE POLICY "Public can read published posts" ON public.posts
  FOR SELECT
  USING (published OR public.is_admin());

CREATE POLICY "Admins can insert posts" ON public.posts
  FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update posts" ON public.posts
  FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete posts" ON public.posts
  FOR DELETE
  USING (public.is_admin());

-- Post images policies
CREATE POLICY "Public can read sections for accessible posts" ON public.post_images
  FOR SELECT
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = post_id AND p.published = true
    )
  );

CREATE POLICY "Admins can insert post images" ON public.post_images
  FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update post images" ON public.post_images
  FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete post images" ON public.post_images
  FOR DELETE
  USING (public.is_admin());
