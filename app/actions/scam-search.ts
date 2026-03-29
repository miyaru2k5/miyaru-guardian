'use server'
import { createClient } from '@/utils/supabase/server';

export async function searchScams(query: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('scam_search_index')
    .select('report_id, scammer_name, search_vector')
    .eq('status', 'approved')
    .ilike('search_vector', `%${query}%`)
    .limit(10);
  
  if (error) throw error;
  return data;
}
