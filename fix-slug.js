const fs = require('fs');
const path = require('path');
const filePath = path.join('app', 'bai-viet', '[slug]', 'page.tsx');
let text = fs.readFileSync(filePath, 'utf8');

const siteLine = 'const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ??  https://admin.miyaru.online;';
const insertText = '\r\n\r\ntype PostWithImages = Post & { post_images?: PostImage[] };\r\n';
const siteIndex = text.indexOf(siteLine);
if (siteIndex === -1) {
  throw new Error('site line not found');
}
text = text.slice(0, siteIndex + siteLine.length) + insertText + text.slice(siteIndex + siteLine.length);

const fetchPostStart = text.indexOf('const fetchPost = async (slug: string) => {');
const fetchRelatedStart = text.indexOf('const fetchRelatedPosts = async (currentId: string) => {', fetchPostStart);
if (fetchPostStart === -1 || fetchRelatedStart === -1) {
  throw new Error('fetch function markers not found');
}
const fetchRest = text.slice(fetchRelatedStart);
const newFetchPost = [
  'const fetchPost = async (slug: string): Promise<PostWithImages | null> => {',
  '  const { data, error } = await supabase',
  '    .from(posts)',
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
].join('\r\n');
text = text.slice(0, fetchPostStart) + newFetchPost + '\r\n\r\n' + fetchRest;

const updatedFetchRelatedStart = text.indexOf('const fetchRelatedPosts = async (currentId: string) => {');
const metadataStart = text.indexOf('export async function generateMetadata', updatedFetchRelatedStart);
if (updatedFetchRelatedStart === -1 || metadataStart === -1) {
  throw new Error('metadata marker not found');
}
const metadataRest = text.slice(metadataStart);
const newRelated = [
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
].join('\r\n');
text = text.slice(0, updatedFetchRelatedStart) + newRelated + '\r\n\r\n' + metadataRest;

fs.writeFileSync(filePath, text);
