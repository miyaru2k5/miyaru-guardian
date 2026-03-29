CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE MATERIALIZED VIEW public.scam_search_index AS
SELECT 
    r.id AS report_id,
    r.scammer_name,
    r.status,
    COALESCE(string_agg(DISTINCT b.account_number, ' '), '') AS bank_accounts,
    COALESCE(string_agg(DISTINCT w.domain, ' '), '') AS domains,
    COALESCE(string_agg(DISTINCT s.username, ' '), '') AS usernames,
    (r.scammer_name || ' ' || 
     COALESCE(string_agg(DISTINCT b.account_number, ' '), '') || ' ' || 
     COALESCE(string_agg(DISTINCT w.domain, ' '), '') || ' ' ||
     COALESCE(string_agg(DISTINCT s.username, ' '), '')) AS search_vector
FROM public.scam_reports r
LEFT JOIN public.scam_banks b ON r.id = b.report_id
LEFT JOIN public.scam_websites w ON r.id = w.report_id
LEFT JOIN public.scam_socials s ON r.id = s.report_id
GROUP BY r.id;

CREATE INDEX idx_scam_search_trgm ON public.scam_search_index USING GIN (search_vector gin_trgm_ops);

-- Function to refresh the view
CREATE OR REPLACE FUNCTION refresh_scam_search_index()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.scam_search_index;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update view on status change
CREATE TRIGGER trigger_refresh_scam_search
AFTER UPDATE OF status ON public.scam_reports
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_scam_search_index();
