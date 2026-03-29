export interface PostImage {
  id: string
  post_id: string
  title: string | null
  content: string | null
  image_url: string
  alt_text: string | null
  caption: string | null
  image_order: number
  created_at: string
}

export interface Post {
  id: string
  slug: string
  title: string
  excerpt: string | null

  meta_title: string | null
  meta_description: string | null
  meta_keywords: string | null

  og_title: string | null
  og_description: string | null
  og_image: string | null

  cover_image: string | null

  author_name: string | null
  author_avatar: string | null

  category: string | null
  tags: string[] | null

  reading_time: number | null
  views: number

  published: boolean

  created_at: string
  updated_at: string

  post_images?: PostImage[]
}

/* dùng cho admin list */

export type PostListItem = Pick<
  Post,
  | "id"
  | "title"
  | "slug"
  | "category"
  | "views"
  | "published"
  | "created_at"
> & {
  sectionsCount?: number
}