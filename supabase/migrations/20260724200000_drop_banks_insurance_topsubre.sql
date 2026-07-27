-- Remove bank deposit module, global insurance fund admin, and topsubre cache

-- bank_accounts
DROP POLICY IF EXISTS "Anyone can view visible banks" ON public.bank_accounts;
DROP POLICY IF EXISTS "Admins can manage banks" ON public.bank_accounts;
DROP POLICY IF EXISTS "Admins can update banks" ON public.bank_accounts;
DROP POLICY IF EXISTS "Admins can delete banks" ON public.bank_accounts;

DROP TRIGGER IF EXISTS update_bank_accounts_updated_at ON public.bank_accounts;

DROP INDEX IF EXISTS public.idx_bank_accounts_visible;

DROP TABLE IF EXISTS public.bank_accounts CASCADE;

-- insurance_fund (global fund / banners — not traders.insurance_fund)
DROP POLICY IF EXISTS "Anyone can view insurance fund" ON public.insurance_fund;
DROP POLICY IF EXISTS "Admins can manage insurance fund" ON public.insurance_fund;
DROP POLICY IF EXISTS "Admins can update insurance fund" ON public.insurance_fund;

DROP TABLE IF EXISTS public.insurance_fund CASCADE;

-- topsubre cache column used only by tang-tuong-tac
ALTER TABLE public.system_settings
  DROP COLUMN IF EXISTS topsubre;
