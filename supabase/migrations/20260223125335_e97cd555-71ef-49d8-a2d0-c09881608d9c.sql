
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create traders table (GDV)
CREATE TABLE public.traders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'OFFLINE' CHECK (status IN ('LIVE', 'OFFLINE')),
  insurance_fund BIGINT NOT NULL DEFAULT 0,
  success_rate NUMERIC(5,2) NOT NULL DEFAULT 100.00,
  description TEXT DEFAULT '',
  avatar_url TEXT,
  service TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.traders ENABLE ROW LEVEL SECURITY;

-- Create transactions table (GDTG)
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_code TEXT NOT NULL UNIQUE,
  buyer_name TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  amount BIGINT NOT NULL DEFAULT 0,
  fee BIGINT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes TEXT DEFAULT '',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create bank_accounts table
CREATE TABLE public.bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  logo_url TEXT,
  qr_image_url TEXT,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

-- Create insurance_fund table
CREATE TABLE public.insurance_fund (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_fund BIGINT NOT NULL DEFAULT 0,
  currently_insured BIGINT NOT NULL DEFAULT 0,
  max_percentage NUMERIC(5,2) NOT NULL DEFAULT 20.00,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.insurance_fund ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Helper function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_traders_updated_at BEFORE UPDATE ON public.traders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON public.bank_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email);
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies

-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Only admins can manage roles" ON public.user_roles FOR ALL USING (public.is_admin());

-- Traders (public read, admin write)
CREATE POLICY "Anyone can view traders" ON public.traders FOR SELECT USING (true);
CREATE POLICY "Admins can manage traders" ON public.traders FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update traders" ON public.traders FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete traders" ON public.traders FOR DELETE USING (public.is_admin());

-- Transactions (admin full, authenticated read own)
CREATE POLICY "Admins can view all transactions" ON public.transactions FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can manage transactions" ON public.transactions FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update transactions" ON public.transactions FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete transactions" ON public.transactions FOR DELETE USING (public.is_admin());

-- Bank accounts
CREATE POLICY "Anyone can view visible banks" ON public.bank_accounts FOR SELECT USING (is_visible = true OR public.is_admin());
CREATE POLICY "Admins can manage banks" ON public.bank_accounts FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update banks" ON public.bank_accounts FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete banks" ON public.bank_accounts FOR DELETE USING (public.is_admin());

-- Insurance fund
CREATE POLICY "Anyone can view insurance fund" ON public.insurance_fund FOR SELECT USING (true);
CREATE POLICY "Admins can manage insurance fund" ON public.insurance_fund FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update insurance fund" ON public.insurance_fund FOR UPDATE USING (public.is_admin());
