 = 'app/bai-viet/[slug]/page.tsx'
 = Get-Content -LiteralPath  -Raw
 = '    \.from\( posts\)\r\n    \.select\(\*, post_images\(\)\)\r\n    \.eq\(slug, slug\)'
 = '    .from( posts)\r\n    .select(*, post_images(*))\r\n    .eq(slug, slug)'
 =  -replace , 
 = '    \.from\(posts\)\r\n    \.select\(id,title,slug,excerpt,cover_image,category,created_at,views\)\r\n    \.eq\(published, true\)\r\n    \.neq\(id, currentId\)'
 = '    .from(posts)\r\n    .select(id,title,slug,excerpt,cover_image,category,created_at,views)\r\n    .eq(published, true)\r\n    .neq(id, currentId)'
 =  -replace , 
Set-Content -LiteralPath  -Value 
