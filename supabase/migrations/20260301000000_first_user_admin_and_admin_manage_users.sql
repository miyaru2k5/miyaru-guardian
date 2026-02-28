-- First registered user becomes admin; rest get user role.
-- Allow admins to delete profiles (for user management).

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_count bigint;
  assign_role public.app_role;
BEGIN
  SELECT COUNT(*) INTO user_count FROM auth.users;
  IF user_count = 1 THEN
    assign_role := 'admin';
  ELSE
    assign_role := 'user';
  END IF;

  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), COALESCE(NEW.email, ''));

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, assign_role);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Allow admins to delete profiles (e.g. when removing a user from admin panel)
CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  USING (public.is_admin());
