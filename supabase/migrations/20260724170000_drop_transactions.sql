-- Remove intermediate-trade transactions module (UI + table)

DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;

DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can manage transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can update transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can delete transactions" ON public.transactions;

DROP INDEX IF EXISTS public.idx_transactions_status_created;

DROP TABLE IF EXISTS public.transactions CASCADE;
