const fs = require('fs');
const path = require('path');
const file = path.join('app', 'bai-viet', '[slug]', 'page.tsx');
const text = fs.readFileSync(file, 'utf8');
const lines = text.split(/\r?\n/);

const siteLineIndex = lines.findIndex(line => line.includes('const siteUrl = process.env.NEXT_PUBLIC_SITE_URL'));
if (siteLineIndex === -1) {
  throw new Error('site line not found');
}
lines.splice(siteLineIndex + 1, 0, '', 'type PostWithImages = Post & { post_images?: PostImage[] };', '');

const fetchPostStart = lines.findIndex(line => line.startsWith('const fetchPost = async (slug: string) => {'));
const fetchRelatedStartOriginal = lines.findIndex(line => line.startsWith('const fetchRelatedPosts = async (currentId: string) => {'));
if (fetchPostStart === -1 || fetchRelatedStartOriginal === -1) {
  throw new Error('post or related markers missing');
}
const newFetchPostLines = [
  'const fetchPost = async (slug: string): Promise<PostWithImages | null> => {',
  '  const { data, error } = await supabase',
  '    .from( posts)',
  '    .select(*, post_images(*))',
  '    .eq(slug, slug)',
  '    .single();',
  '',
  '  if (error || !data) {',
  '    return null;',
  '  }',
  '',
  '  return data as PostWithImages;',
  '};'
];
lines.splice(fetchPostStart, fetchRelatedStartOriginal - fetchPostStart, ...newFetchPostLines, '');

const fetchRelatedStart = lines.findIndex(line => line.startsWith('const fetchRelatedPosts = async (currentId: string) => {'));
const metadataStart = lines.findIndex(line => line.startsWith('export async function generateMetadata'));
if (fetchRelatedStart === -1 || metadataStart === -1) {
  throw new Error('related or metadata markers missing');
}
const newRelatedLines = [
  'const fetchRelatedPosts = async (currentId: string): Promise<Post[]> => {',
  '  const { data } = await supabase',
  '    .from(posts)',
  '    .select(id,title,slug,excerpt,cover_image,category,created_at,views)',
  '    .eq(published, true)',
  '    .neq(id, currentId)',
  '    .order(created_at, { ascending: false })',
  '    .limit(3);',
  '',
  '  return (data ?? []) as Post[];',
  '};'
];
lines.splice(fetchRelatedStart, metadataStart - fetchRelatedStart, ...newRelatedLines, '');

fs.writeFileSync(file, lines.join('\r\n'));
