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
/* -------------------------------- */

const SECTION_ACCENTS = [
  {
    border: "border-blue-400/60",
    bg: "bg-blue-50 dark:bg-blue-500/10",
    badge: "bg-blue-500 text-white",
    icon: <FileText className="h-3.5 w-3.5" />,
    label: "blue",
    ring: "ring-blue-400/30",
    bar: "bg-blue-500",
  },
  {
    border: "border-indigo-400/60",
    bg: "bg-indigo-50 dark:bg-indigo-500/10",
    badge: "bg-indigo-500 text-white",
    icon: <Layers className="h-3.5 w-3.5" />,
    label: "indigo",
    ring: "ring-indigo-400/30",
    bar: "bg-indigo-500",
  },
  {
    border: "border-cyan-400/60",
    bg: "bg-cyan-50 dark:bg-cyan-500/10",
    badge: "bg-cyan-500 text-white",
    icon: <AlignLeft className="h-3.5 w-3.5" />,
    label: "cyan",
    ring: "ring-cyan-400/30",
    bar: "bg-cyan-500",
  },
  {
    border: "border-emerald-400/60",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    badge: "bg-emerald-500 text-white",
    icon: <Sparkles className="h-3.5 w-3.5" />,
    label: "emerald",
    ring: "ring-emerald-400/30",
    bar: "bg-emerald-500",
  },
  {
    border: "border-amber-400/60",
    bg: "bg-amber-50 dark:bg-amber-500/10",
    badge: "bg-amber-500 text-white",
    icon: <Star className="h-3.5 w-3.5" />,
    label: "amber",
    ring: "ring-amber-400/30",
    bar: "bg-amber-500",
  },
  {
    border: "border-rose-400/60",
    bg: "bg-rose-50 dark:bg-rose-500/10",
    badge: "bg-rose-500 text-white",
    icon: <Zap className="h-3.5 w-3.5" />,
    label: "rose",
    ring: "ring-rose-400/30",
    bar: "bg-rose-500",
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
      post.meta_description ?? post.excerpt ?? "Thông tin từ Miyaru",
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
    .filter(function (s) { return Boolean(s.title); })
    .sort(function (a, b) { return (a.image_order ?? 0) - (b.image_order ?? 0); })
    .map(function (s) {
      return {
        id: "section-" + s.image_order,
        title: s.title ?? "Section",
      };
    });
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
      <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/40 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 shadow-sm dark:bg-blue-500/10 dark:text-blue-400">
        <User className="h-3.5 w-3.5" />
        Admin
      </span>

      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
        <CalendarDays className="h-3.5 w-3.5" />
        {dateStr}
      </span>

      {post.reading_time && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-600 shadow-sm dark:bg-emerald-500/10 dark:text-emerald-400">
          <Clock className="h-3.5 w-3.5" />
          {post.reading_time} phút đọc
        </span>
      )}

      <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-400/40 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-500 shadow-sm dark:bg-orange-500/10">
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
          <span className="text-slate-400">
            {hasImage
              ? <ImageIcon className="h-3 w-3" />
              : <FileText className="h-3 w-3" />}
          </span>
          <p className="truncate text-sm font-semibold text-slate-700 dark:text-slate-200">
            {section.title ?? "Phần " + (index + 1)}
          </p>
        </div>

        {section.caption && (
          <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">
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
      {/* Card header bar */}
      <div className={`flex items-center gap-3 px-6 py-4 ${accent.bg}`}>
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold shadow-sm ${accent.badge}`}
        >
          {String(index + 1).padStart(2, "0")}
        </div>
        <div className="flex items-center gap-2">
          <span className="opacity-60">{accent.icon}</span>
          {section.title && (
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
              {section.title}
            </h3>
          )}
        </div>
        <div className="ml-auto">
          <Hash className="h-4 w-4 text-slate-300 dark:text-slate-600" />
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
        <div className="px-6 py-5">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="leading-relaxed text-slate-600 dark:text-slate-300">
              {section.content}
            </p>
          </div>
        </div>
      )}

      {/* Caption */}
      {section.caption && (
        <div className={`border-t px-6 py-3 ${accent.bg} ${accent.border}`}>
          <p className="text-xs italic text-slate-400">{section.caption}</p>
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
        className="group flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/60"
      >
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm ${accent.badge}`}
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
    <aside className="sticky top-24 hidden w-72 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900 lg:block">

      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-4 dark:border-slate-800 dark:from-blue-500/10 dark:to-indigo-500/10">
        <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-500 shadow-sm">
          <List className="h-4 w-4 text-white" />
        </div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
          Mục lục
        </p>
        <span className="ml-auto rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
          {toc.length}
        </span>
      </div>

      {/* Items */}
      <ul className="space-y-0.5 p-3">
        {toc.map(function (item, i) {
          return <TocListItem key={item.id} item={item} index={i} />;
        })}
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
    <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-8 shadow-xl sm:px-10">

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-blue-600/25 blur-3xl" />
        <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/20 ring-1 ring-blue-500/30">
            <Share2 className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <p className="font-bold text-white">Chia sẻ tin tức</p>
            <p className="text-xs text-slate-400">
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
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-500 shadow-sm">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Tin tức liên quan
          </h3>
          <div className="h-px w-16 bg-gradient-to-r from-indigo-200 to-transparent dark:from-indigo-900/50 sm:w-32" />
        </div>

        <Link
          href="/bai-viet"
          className="flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
        >
          Xem tất cả
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map(function (related) {
          return <BlogCard key={related.id} post={related} />;
        })}
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
    ? [...post.post_images].sort(function (a, b) {
        return (a.image_order ?? 0) - (b.image_order ?? 0);
      })
    : [];

  return (
    <MainLayout>
      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-28 pt-20 sm:pt-24 lg:pt-28">

        {/* Meta chips */}
        <MetaBar post={post} />

        {/* Article Header */}
        <ArticleHeader post={post} />

        {/* Cover image */}
        {post.cover_image && (
          <figure className="relative h-[320px] overflow-hidden rounded-3xl bg-slate-100 shadow-xl ring-1 ring-slate-200 dark:ring-slate-800 sm:h-[420px] lg:h-[480px]">
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
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-500 shadow-sm">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">
                Nội dung chi tiết
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-blue-200 to-transparent dark:from-blue-900/50" />
            </div>

            {/* Render each section as a colored card */}
            {sortedSections.length > 0 ? (
              <div className="flex flex-col gap-6">
                {sortedSections.map(function (section, i) {
                  return (
                    <SectionContentCard
                      key={section.id}
                      section={section}
                      index={i}
                    />
                  );
                })}
              </div>
            ) : (
              /* Fallback to ArticleContent if no post_images */
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md dark:border-slate-800 dark:bg-slate-900">
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
        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-800" />

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