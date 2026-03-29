'use server'
import { createClient } from '@/utils/supabase/server';

export async function searchScams(query: string) {
  const supabase = await createClient();
  
  // First, get matching report IDs from search index
  const { data: searchResults, error: searchError } = await supabase
    .from('scam_search_index')
    .select('report_id, scammer_name, search_vector')
    .eq('status', 'approved')
    .ilike('search_vector', `%${query}%`)
    .limit(10);
  
  if (searchError) throw searchError;
  
  if (!searchResults || searchResults.length === 0) {
    return [];
  }

  // Then, get more details for these reports
  const reportIds = searchResults.map(r => r.report_id);
  
  const { data: reports, error: reportsError } = await supabase
    .from('scam_reports')
    .select('id, scammer_name, total_scam_amount, type, created_at, description')
    .in('id', reportIds);

  if (reportsError) throw reportsError;

  return reports?.map(report => ({
    report_id: report.id,
    scammer_name: report.scammer_name,
    total_scam_amount: report.total_scam_amount,
    type: report.type,
    created_at: report.created_at,
    description: report.description?.substring(0, 100) + '...'
  })) || [];
}
