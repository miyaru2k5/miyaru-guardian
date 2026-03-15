import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import BlogCard from "@/components/BlogCard";
import ArticleHeader from "@/components/ArticleHeader";
import ArticleContent from "@/components/ArticleContent";
import ShareButtons from "@/components/ShareButtons";
import MainLayout from "@/layouts/MainLayout";

import { supabase } from "@/lib/supabase";
import type { Post, PostImage } from "@/types/posts";

import {
  BookOpen,
  List,
  Share2,
  TrendingUp,
  ArrowRight,
  Clock,
  User,
  CalendarDays,
  Flame,
  FileText,
  ImageIcon,
  AlignLeft,
  Layers,
  Sparkles,
  Star,
  Zap,
  Hash,
} from "lucide-react";

export const revalidate = 60;

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://admin.miyaru.online";

type PostWithImages = Post & {
  post_images?: PostImage[];
};

interface ArticlePageProps {
  params: {
    slug: string;
  };
}

interface TocItem {
  id: string;
  title: string;
}

/* -------------------------------- */
/* SECTION ACCENT CONFIG            */
/* Dùng primary / accent / secondary từ theme hệ thống  */
/* Xoay vòng bằng opacity để tạo sự đa dạng             */
/* -------------------------------- */

const SECTION_ACCENTS = [
  {
    border: "border-primary/50",
    bg: "bg-primary/10",
    badge: "bg-primary text-primary-foreground",
    icon: <FileText className="h-3.5 w-3.5" />,
    ring: "ring-primary/20",
    bar: "bg-primary",
  },
  {
    border: "border-accent/50",
    bg: "bg-accent/10",
    badge: "bg-accent text-accent-foreground",
    icon: <Layers className="h-3.5 w-3.5" />,
    ring: "ring-accent/20",
    bar: "bg-accent",
  },
  {
    border: "border-primary/40",
    bg: "bg-primary/[0.07]",
    badge: "bg-primary/80 text-primary-foreground",
    icon: <AlignLeft className="h-3.5 w-3.5" />,
    ring: "ring-primary/15",
    bar: "bg-primary/80",
  },
  {
    border: "border-accent/40",
    bg: "bg-accent/[0.07]",
    badge: "bg-accent/80 text-accent-foreground",
    icon: <Sparkles className="h-3.5 w-3.5" />,
    ring: "ring-accent/15",
    bar: "bg-accent/80",
  },
  {
    border: "border-primary/60",
    bg: "bg-primary/[0.12]",
    badge: "bg-primary/90 text-primary-foreground",
    icon: <Star className="h-3.5 w-3.5" />,
    ring: "ring-primary/25",
    bar: "bg-primary/90",
  },
  {
    border: "border-accent/60",
    bg: "bg-accent/[0.12]",
    badge: "bg-accent/90 text-accent-foreground",
    icon: <Zap className="h-3.5 w-3.5" />,
    ring: "ring-accent/25",
    bar: "bg-accent/90",
  },
];

/* -------------------------------- */
/* FETCH POST                       */
/* -------------------------------- */

const fetchPost = async (
  slug: string
): Promise<PostWithImages | null> => {
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

/* -------------------------------- */
/* FETCH RELATED POSTS              */
/* -------------------------------- */

const fetchRelatedPosts = async (
  currentId: string
): Promise<Post[]> => {
  const { data } = await supabase
    .from("posts")
    .select(
      "id,title,slug,excerpt,cover_image,category,created_at,views"
    )
    .eq("published", true)
    .neq("id", currentId)
    .order("created_at", { ascending: false })
    .limit(3);

  return (data ?? []) as Post[];
};

/* -------------------------------- */
/* SEO                              */
/* -------------------------------- */

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const post = await fetchPost(params.slug);

  if (!post) {
    return {
      title: "Tin tức không tìm thấy",
      description: "Không tìm thấy tin tức.",
    };
  }

  return {
    title: post.meta_title ?? post.title,
    description:
      post.meta_description ?? post.excerpt ?? "Thông tin từ Admin",
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

/* -------------------------------- */
/* TABLE OF CONTENTS                */
/* -------------------------------- */

function buildToc(sections?: PostImage[]): TocItem[] {
  if (!sections || sections.length === 0) return [];

  return sections
    .filter((s) => Boolean(s.title))
    .sort((a, b) => (a.image_order ?? 0) - (b.image_order ?? 0))
    .map((s) => ({
      id: "section-" + s.image_order,
      title: s.title ?? "Section",
    }));
}

/* -------------------------------- */
/* META BAR                         */
/* -------------------------------- */

function MetaBar({ post }: { post: Post }) {
  const dateStr = new Date(post.created_at).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {/* Author — primary */}
      <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary shadow-sm">
        <User className="h-3.5 w-3.5" />
        Admin
      </span>

      {/* Date — secondary/border */}
      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
        <CalendarDays className="h-3.5 w-3.5" />
        {dateStr}
      </span>

      {/* Reading time — accent */}
      {post.reading_time && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent-foreground shadow-sm">
          <Clock className="h-3.5 w-3.5" />
          {post.reading_time} phút đọc
        </span>
      )}

      {/* Featured — primary (bold) */}
      <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/50 bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary shadow-sm">
        <Flame className="h-3.5 w-3.5" />
        Nổi bật
      </span>
    </div>
  );
}

/* -------------------------------- */
/* SECTION INDEX PREVIEW            */
/* -------------------------------- */

function SectionIndexItem({
  section,
  index,
}: {
  section: PostImage;
  index: number;
}) {
  const accent = SECTION_ACCENTS[index % SECTION_ACCENTS.length];
  const hasImage = Boolean(section.image_url);

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border p-4 shadow-sm transition hover:shadow-md ${accent.border} ${accent.bg} ring-1 ${accent.ring}`}
    >
      {/* Number badge */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold shadow ${accent.badge}`}
      >
        {String(index + 1).padStart(2, "0")}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">
            {hasImage
              ? <ImageIcon className="h-3 w-3" />
              : <FileText className="h-3 w-3" />}
          </span>
          <p className="truncate text-sm font-semibold text-foreground">
            {section.title ?? "Phần " + (index + 1)}
          </p>
        </div>

        {section.caption && (
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
            {section.caption}
          </p>
        )}
      </div>

      {/* Color bar */}
      <div className={`h-full w-1 shrink-0 self-stretch rounded-full ${accent.bar} opacity-60`} />
    </div>
  );
}

/* -------------------------------- */
/* SECTION CONTENT CARD             */
/* -------------------------------- */

function SectionContentCard({
  section,
  index,
}: {
  section: PostImage;
  index: number;
}) {
  const accent = SECTION_ACCENTS[index % SECTION_ACCENTS.length];

  return (
    <div
      id={"section-" + section.image_order}
      className={`overflow-hidden rounded-3xl border shadow-md ${accent.border}`}
    >
      {/* Card header */}
      <div className={`flex items-center gap-3 px-6 py-4 ${accent.bg}`}>
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold shadow-sm ${accent.badge}`}
        >
          {String(index + 1).padStart(2, "0")}
        </div>
        <div className="flex items-center gap-2">
          <span className="opacity-60">{accent.icon}</span>
          {section.title && (
            <h3 className="text-sm font-bold text-foreground">
              {section.title}
            </h3>
          )}
        </div>
        <div className="ml-auto">
          <Hash className="h-4 w-4 text-muted-foreground/40" />
        </div>
      </div>

      {/* Divider */}
      <div className={`h-px w-full ${accent.bar} opacity-30`} />

      {/* Image */}
      {section.image_url && (
        <div className="relative h-52 w-full overflow-hidden sm:h-64">
          <Image
            src={section.image_url}
            alt={section.alt_text ?? section.title ?? ""}
            fill
            className="object-cover"
            sizes="(min-width:1024px) 60vw, 100vw"
          />
        </div>
      )}

      {/* Text content */}
      {section.content && (
        <div className="bg-card px-6 py-5">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="leading-relaxed text-muted-foreground">
              {section.content}
            </p>
          </div>
        </div>
      )}

      {/* Caption */}
      {section.caption && (
        <div className={`border-t px-6 py-3 ${accent.bg} ${accent.border}`}>
          <p className="text-xs italic text-muted-foreground">{section.caption}</p>
        </div>
      )}
    </div>
  );
}

/* -------------------------------- */
/* TOC ITEM                         */
/* -------------------------------- */

function TocListItem({ item, index }: { item: TocItem; index: number }) {
  const accent = SECTION_ACCENTS[index % SECTION_ACCENTS.length];

  return (
    <li>
      <a
        href={"#" + item.id}
        className="group flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary"
      >
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold shadow-sm ${accent.badge}`}
        >
          {index + 1}
        </span>
        <span className="line-clamp-2 leading-snug">{item.title}</span>
      </a>
    </li>
  );
}

/* -------------------------------- */
/* TOC SIDEBAR                      */
/* -------------------------------- */

function TocSidebar({ toc }: { toc: TocItem[] }) {
  return (
    <aside className="sticky top-24 hidden w-72 shrink-0 overflow-hidden rounded-2xl border border-border bg-card shadow-lg lg:block">

      {/* Header — primary gradient */}
      <div className="flex items-center gap-2 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10 px-5 py-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary shadow-sm">
          <List className="h-4 w-4 text-primary-foreground" />
        </div>
        <p className="text-xs font-bold uppercase tracking-wider text-foreground">
          Mục lục
        </p>
        <span className="ml-auto rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">
          {toc.length}
        </span>
      </div>

      {/* Items */}
      <ul className="space-y-0.5 p-3">
        {toc.map((item, i) => (
          <TocListItem key={item.id} item={item} index={i} />
        ))}
      </ul>

    </aside>
  );
}

/* -------------------------------- */
/* SHARE SECTION                    */
/* -------------------------------- */

function ShareSection({
  shareUrl,
  title,
}: {
  shareUrl: string;
  title: string;
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-card px-6 py-8 shadow-xl ring-1 ring-border sm:px-10">

      {/* Orbs — primary / accent */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/20 ring-1 ring-primary/30">
            <Share2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-bold text-foreground">Chia sẻ tin tức</p>
            <p className="text-xs text-muted-foreground">
              Lan toả thông tin hữu ích đến mọi người
            </p>
          </div>
        </div>
        <ShareButtons url={shareUrl} title={title} />
      </div>

    </section>
  );
}

/* -------------------------------- */
/* RELATED SECTION                  */
/* -------------------------------- */

function RelatedSection({ posts }: { posts: Post[] }) {
  return (
    <section className="space-y-6">

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary shadow-sm">
            <TrendingUp className="h-4 w-4 text-primary-foreground" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Tin tức liên quan
          </h3>
          <div className="h-px w-16 bg-gradient-to-r from-primary/30 to-transparent sm:w-32" />
        </div>

        <Link
          href="/bai-viet"
          className="flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/20"
        >
          Xem tất cả
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((related) => (
          <BlogCard key={related.id} post={related} />
        ))}
      </div>

    </section>
  );
}

/* -------------------------------- */
/* PAGE                             */
/* -------------------------------- */

export default async function ArticlePage({
  params,
}: ArticlePageProps) {
  const post = await fetchPost(params.slug);

  if (!post) notFound();

  const relatedPosts = await fetchRelatedPosts(post.id);
  const toc = buildToc(post.post_images);
  const shareUrl = `${siteUrl}/bai-viet/${post.slug}`;

  const sortedSections = post.post_images
    ? [...post.post_images].sort(
        (a, b) => (a.image_order ?? 0) - (b.image_order ?? 0)
      )
    : [];

  return (
    <MainLayout>
      <main className="mx-auto mt-6 flex max-w-6xl flex-col gap-10 px-4 pb-28 pt-20 sm:pt-24 lg:pt-28">

        {/* Meta chips */}
        <MetaBar post={post} />

        {/* Article Header */}
        <ArticleHeader post={post} />

        {/* Cover image */}
        {post.cover_image && (
          <figure className="relative h-[320px] overflow-hidden rounded-3xl bg-secondary shadow-xl ring-1 ring-border sm:h-[420px] lg:h-[480px]">
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(min-width:1024px) 80vw, 100vw"
              priority
            />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/40 to-transparent" />
          </figure>
        )}

        {/* Content + TOC */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">

          {/* Article body */}
          <div className="min-w-0 flex-1">

            {/* Content section label */}
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary shadow-sm">
                <FileText className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                Nội dung chi tiết
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
            </div>

            {/* Render each section as a colored card */}
            {sortedSections.length > 0 ? (
              <div className="flex flex-col gap-6">
                {sortedSections.map((section, i) => (
                  <SectionContentCard
                    key={section.id}
                    section={section}
                    index={i}
                  />
                ))}
              </div>
            ) : (
              /* Fallback to ArticleContent if no post_images */
              <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-md">
                <div className="prose max-w-none p-6 dark:prose-invert sm:p-8">
                  <ArticleContent sections={post.post_images} />
                </div>
              </div>
            )}

          </div>

          {/* TOC Sidebar */}
          {toc.length > 0 && <TocSidebar toc={toc} />}

        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* Share */}
        <ShareSection shareUrl={shareUrl} title={post.title} />

        {/* Related */}
        {relatedPosts.length > 0 && (
          <RelatedSection posts={relatedPosts} />
        )}

      </main>
    </MainLayout>
  );
}