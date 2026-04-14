import { notFound } from "next/navigation";
import Image from "next/image";

import ArticleHeader from "@/components/ArticleHeader";
import ArticleContent from "@/components/ArticleContent";
import ShareButtons from "@/components/ShareButtons";
import BlogSidebar from "@/components/BlogSidebar";
import MainLayout from "@/layouts/MainLayout";

import { supabase } from "@/lib/supabase";
import type { Post, PostImage } from "@/types/posts";

import { Share2 } from "lucide-react";

export const revalidate = 60;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://admin.miyaru.online";

type PostWithImages = Post & {
  post_images?: PostImage[];
};

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

const fetchPost = async (slug: string): Promise<PostWithImages | null> => {
  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      post_images (
        id,
        title,
        content,
        image_url,
        alt_text,
        caption,
        image_order
      )
    `)
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return data as unknown as PostWithImages;
};

const fetchRelatedPosts = async (currentId: string, category: string | null): Promise<Post[]> => {
  let query = supabase
    .from("posts")
    .select("id,title,slug,excerpt,cover_image,category,created_at,views")
    .eq("published", true)
    .neq("id", currentId);
    
  if (category) {
    query = query.eq("category", category);
  }
  
  const { data } = await query.order("created_at", { ascending: false }).limit(3);
  return (data ?? []) as Post[];
};

const fetchSidebarData = async () => {
  const { data } = await supabase
    .from("posts")
    .select("category, tags")
    .eq("published", true);

  if (!data) return { categories: [], tags: [] };

  const catMap: Record<string, number> = {};
  const tagSet = new Set<string>();

  data.forEach((post) => {
    if (post.category) {
      catMap[post.category] = (catMap[post.category] || 0) + 1;
    }
    if (post.tags && Array.isArray(post.tags)) {
      post.tags.forEach((tag: string) => tagSet.add(tag));
    }
  });

  const categories = Object.entries(catMap).map(([name, count]) => ({
    name,
    count,
  }));

  return {
    categories,
    tags: Array.from(tagSet),
  };
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await fetchPost(slug);

  if (!post) {
    return {
      title: "Tin tức không tìm thấy",
      description: "Không tìm thấy tin tức.",
    };
  }

  return {
    title: post.meta_title ?? post.title,
    description: post.meta_description ?? post.excerpt ?? "Thông tin từ Admin",
    keywords: post.meta_keywords ?? undefined,
    openGraph: {
      title: post.og_title ?? post.title,
      description: post.og_description ?? post.excerpt ?? "",
      images: post.og_image
        ? [{ url: post.og_image }]
        : post.cover_image
        ? [{ url: post.cover_image }]
        : [],
      url: `${siteUrl}/bai-viet/${post.slug}`,
    },
  };
}

function ShareSection({ shareUrl, title }: { shareUrl: string; title: string }) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-[#16141c] px-6 py-8 shadow-xl ring-1 ring-white/10 sm:px-10">
      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pink-500/20 ring-1 ring-pink-500/30">
            <Share2 className="h-5 w-5 text-pink-500" />
          </div>
          <div>
            <p className="font-bold text-white">Chia sẻ tin tức</p>
            <p className="text-xs text-gray-400">
              Lan toả thông tin hữu ích đến mọi người
            </p>
          </div>
        </div>
        <ShareButtons url={shareUrl} title={title} />
      </div>
    </section>
  );
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const post = await fetchPost(slug);

  if (!post) notFound();

  const [relatedPosts, sidebarData] = await Promise.all([
    fetchRelatedPosts(post.id, post.category),
    fetchSidebarData(),
  ]);

  const shareUrl = `${siteUrl}/bai-viet/${post.slug}`;

  return (
    <MainLayout>
      <main className="mx-auto mt-6 flex max-w-6xl flex-col gap-10 px-4 pb-28 pt-20 sm:pt-24 lg:pt-28">
        
        {/* Article Header */}
        <ArticleHeader post={post} />

        {/* Cover image */}
        {post.cover_image && (
          <figure className="relative h-[320px] w-full overflow-hidden rounded-3xl sm:h-[420px] lg:h-[500px]">
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(min-width:1024px) 80vw, 100vw"
              priority
            />
          </figure>
        )}

        {/* Content + Sidebar */}
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start">
          
          {/* Article body */}
          <div className="min-w-0 flex-1">
             <ArticleContent sections={post.post_images} />
          </div>

          {/* Sidebar */}
          <BlogSidebar 
            relatedPosts={relatedPosts} 
            categories={sidebarData.categories} 
            tags={sidebarData.tags} 
          />
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10" />

        {/* Share */}
        <ShareSection shareUrl={shareUrl} title={post.title} />

      </main>
    </MainLayout>
  );
}