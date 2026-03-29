from pathlib import Path
path = Path('components/admin/posts/PostsList.tsx')
text = path.read_text(encoding='utf-8')
old = 'import PostsForm, { PostFormValues } from "./PostsForm";\nimport type { Post, PostListItem } from "@/types/posts";'
new = 'import PostsForm, { PostFormValues } from "./PostsForm";\nimport type { Post, PostImage, PostListItem } from "@/types/posts";'
if old not in text:
    raise SystemExit('import block not found')
text = text.replace(old, new, 1)
text = text.replace('.from("posts")\n        .select(POSTS_COLUMNS)', '.from<PostListItem>("posts")\n        .select(POSTS_COLUMNS)', 1)
text = text.replace('.from("post_images")\n          .select("post_id")', '.from<PostImage>("post_images")\n          .select("post_id")', 1)
text = text.replace('.from("posts")\n          .select("*")', '.from<Post>("posts")\n          .select("*")', 1)
text = text.replace('.from("post_images")\n          .select("*")', '.from<PostImage>("post_images")\n          .select("*")', 1)
path.write_text(text, encoding='utf-8')
