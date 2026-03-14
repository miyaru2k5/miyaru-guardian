 = 'app/bai-viet/[slug]/page.tsx'
 = Get-Content -LiteralPath  -Raw
 = 'const siteUrl = process.env.NEXT_PUBLIC_SITE_URL \?\?  https://admin.miyaru.online;\r?\n\r?\nconst fetchPost'
if ( -notmatch ) { throw 'pattern not found' }
 = 'const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? https://admin.miyaru.online;\r\n\r\ntype PostWithImages = Post & { post_images?: PostImage[] };\r\n\r\nconst fetchPost'
 = [regex]::Replace(, , , [System.Text.RegularExpressions.RegexOptions]::None, 1)
Set-Content -LiteralPath  -Value 
