-- Create Enum for Report Status
CREATE TYPE scam_report_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE scam_report_type AS ENUM ('tôi bị scam', 'đăng hộ');

-- Create ScamReports Table
CREATE TABLE public.scam_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scammer_name TEXT NOT NULL,
  total_scam_amount DECIMAL(15, 2) NOT NULL,
  description TEXT NOT NULL,
  type scam_report_type NOT NULL,
  original_post_url TEXT,
  reporter_contact_name TEXT NOT NULL,
  reporter_contact_zalo TEXT NOT NULL,
  status scam_report_status DEFAULT 'pending',
  slug TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Related Tables
CREATE TABLE public.scam_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.scam_reports(id) ON DELETE CASCADE,
  url TEXT NOT NULL
);

CREATE TABLE public.scam_socials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.scam_reports(id) ON DELETE CASCADE,
  platform_name TEXT,
  platform_url TEXT,
  username TEXT,
  user_url TEXT
);

CREATE TABLE public.scam_banks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.scam_reports(id) ON DELETE CASCADE,
  bank_name TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL
);

CREATE TABLE public.scam_websites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.scam_reports(id) ON DELETE CASCADE,
  website_name TEXT,
  url TEXT,
  domain TEXT
);

CREATE TABLE public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link TEXT NOT NULL,
  position TEXT NOT NULL, -- e.g., 'header', 'sidebar'
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ
);
