'use server'
import { createClient } from '@/utils/supabase/server';

export async function searchScams(query: string) {
  const supabase = await createClient();

  const { data: searchResults, error: searchError } = await supabase
    .from('scam_search_index')
    .select(`
        report_id, 
        scammer_name, 
        status, 
        slug,
        total_scam_amount, 
        type, 
        created_at, 
        description
    `)
    .eq('status', 'approved')
    .ilike('search_vector', `%${query}%`)
    .limit(10);

  if (searchError) throw searchError;

  return searchResults?.map(report => ({
    report_id: report.report_id,
    scammer_name: report.scammer_name,
    slug: report.slug,
    total_scam_amount: report.total_scam_amount,
    type: report.type,
    created_at: report.created_at,
    description: report.description?.substring(0, 100) + '...'
  })) || [];
}

export async function getScamStats() {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_scam_stats');

  if (error) {
    console.error('Error fetching scam stats:', error);
    return {
      scamAccounts: 0,
      scamFbs: 0,
      comments: 0,
      pending: 0,
    };
  }

  return {
    scamAccounts: data.scam_accounts || 0,
    scamFbs: data.scam_fbs || 0,
    comments: data.comments || 0,
    pending: data.pending || 0,
  };
}

export async function getBanners() {
  const supabase = await createClient();
  const { data: banners, error } = await supabase
    .from('banners')
    .select('*')
    .order('position', { ascending: true });

  if (error) {
    console.error('Error fetching banners:', error);
    return [];
  }

  return banners;
}

export async function getScamLists() {
  const supabase = await createClient();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: latestScams, error: latestScamsError } = await supabase
    .from('scam_reports')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(50);

  // const { data: popularScams, error: popularScamsError } = await supabase
  //     .from('scam_reports')
  //     .select('scammer_name, count: report_count')
  //     .gte('created_at', sevenDaysAgo)
  //     .group('scammer_name')
  //     .order('count', { ascending: false })
  //     .limit(10);

  const { data: topSearched, error: topSearchedError } = await supabase
    .from('scam_reports')
    .select('*')
    .order('views', { ascending: false })
    .limit(3);

  if (latestScamsError || topSearchedError) {
    console.error('Error fetching scam lists:', { latestScamsError, topSearchedError });
  }

  return {
    latestScams: latestScams || [],
    popularScams: [],
    topSearched: topSearched || [],
  };
}

export async function getRecentComments() {
  const supabase = await createClient();
  const { data: comments, error } = await supabase
    .from('comments')
    .select('*, user:users(full_name, avatar_url)')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching recent comments:', error);
    return [];
  }

  return comments;
}
