 = 'app/bai-viet/[slug]/page.tsx'
 = Get-Content -LiteralPath  -Raw
 = [regex]::Escape('const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ??  https://admin.miyaru.online;\r\n\r\n')
 = 'const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? https://admin.miyaru.online;\r\n\r\ntype PostWithImages = Post & { post_images?: PostImage[] };\r\n\r\n'
 = [regex]::Replace(, , , 1)

 = [regex]::Escape('const fetchPost = async (slug: string): Promise<PostWithImages | null> => {\r\n  const { data, error } = await supabase\r\n    .from( posts)\r\n    .select(*, post_images(*))\r\n    .eq(slug, slug)\r\n    .single();\r\n\r\n  if (error || !data) {\r\n    return null;\r\n  }\r\n\r\n  return data as PostWithImages;\r\n};\r\n')
 = 'const fetchPost = async (slug: string): Promise<PostWithImages | null> => {\r\n  const { data, error } = await supabase\r\n    .from(posts)\r\n    .select(*, post_images(*))\r\n    .eq(slug, slug)\r\n    .single();\r\n\r\n  if (error || !data) {\r\n    return null;\r\n  }\r\n\r\n  return data as PostWithImages;\r\n};\r\n'
 = [regex]::Replace(, , , 1)

 = [regex]::Escape('const fetchRelatedPosts = async (currentId: string): Promise<Post[]> => {\r\n  const { data } = await supabase\r\n    .from(posts)\r\n    .select(id,title,slug,excerpt,cover_image,category,created_at,views)\r\n    .eq(published, true)\r\n    .neq(id, currentId)\r\n    .order(created_at, { ascending: false })\r\n    .limit(3);\r\n\r\n  return (data ?? []) as Post[];\r\n};\r\n')
 = 'const fetchRelatedPosts = async (currentId: string): Promise<Post[]> => {\r\n  const { data } = await supabase\r\n    .from(posts)\r\n    .select(id,title,slug,excerpt,cover_image,category,created_at,views)\r\n    .eq(published, true)\r\n    .neq(id, currentId)\r\n    .order(created_at, { ascending: false })\r\n    .limit(3);\r\n\r\n  return (data ?? []) as Post[];\r\n};\r\n'
 = [regex]::Replace(, , , 1)

Set-Content -LiteralPath  -Value 
