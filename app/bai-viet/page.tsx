import { supabase } from "@/lib/supabase";
import type { Post } from "@/types/posts";
import MainLayout from "@/layouts/MainLayout";

import Image from "next/image";
import Link from "next/link";

import {
  BookOpen,
  TrendingUp,
  Sparkles,
  Clock,
  ChevronRight,
  Flame,
  Newspaper,
  Rss,
  Star,
  Eye,
  ArrowUpRight,
  Layers,
  Zap,
  BarChart2,
  CalendarDays,
  User,
} from "lucide-react";

export const revalidate = 60;

export const metadata = {
  title: "Tin tức - Admin",
  description: "Tổng hợp kiến thức, tin tức và chia sẻ mới nhất từ Admin.",
};

/* -------------------------------------------------- */
/* Fetch Posts */
/* -------------------------------------------------- */

async function fetchPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase error:", error);
    return [];
  }

  return (data ?? []) as Post[];
}

/* -------------------------------------------------- */
/* Helpers */
/* -------------------------------------------------- */

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateShort(date: string) {
  return new Date(date).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "short",
  });
}

/* -------------------------------------------------- */
/* Page Header */
/* -------------------------------------------------- */

function PageHeader() {
  return (
    <div className="relative mb-10 overflow-hidden rounded-3xl bg-slate-950 px-8 py-16 sm:px-14 sm:py-20">

      {/* Animated orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-80 w-80 animate-pulse rounded-full bg-blue-600/30 blur-3xl" />
        <div className="absolute -bottom-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl" />
        <div
          className="absolute -right-20 top-10 h-64 w-64 animate-pulse rounded-full bg-cyan-500/15 blur-3xl"
          style={{ animationDelay: "1.5s" }}
        />

        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 56px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 56px)",
          }}
        />

        {/* Border glows */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col gap-6">

        {/* Top badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/40 bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
            Live · Cập nhật liên tục
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-400">
            <Rss className="h-3 w-3" />
            Admin News
          </span>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Tin tức &amp;{" "}
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              Kiến thức
            </span>
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-400 sm:text-base">
            Tổng hợp chuyên sâu, tin tức mới nhất và những chia sẻ thực tế
            từ đội ngũ{" "}
            <span className="font-semibold text-white">Admin</span>.
          </p>
        </div>

        {/* Stat chips */}
        <div className="flex flex-wrap gap-3 pt-2">
          {[
            {
              icon: <Layers className="h-3.5 w-3.5" />,
              label: "Chuyên sâu",
              color: "text-blue-400 border-blue-500/30 bg-blue-500/10",
            },
            {
              icon: <Zap className="h-3.5 w-3.5" />,
              label: "Thực tế",
              color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
            },
            {
              icon: <BarChart2 className="h-3.5 w-3.5" />,
              label: "Có số liệu",
              color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
            },
            {
              icon: <CalendarDays className="h-3.5 w-3.5" />,
              label: "Mỗi tuần",
              color: "text-indigo-400 border-indigo-500/30 bg-indigo-500/10",
            },
          ].map((chip) => (
            <span
              key={chip.label}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${chip.color}`}
            >
              {chip.icon}
              {chip.label}
            </span>
          ))}
        </div>

      </div>
    </div>
  );
}

/* -------------------------------------------------- */
/* Stats Bar */
/* -------------------------------------------------- */

function StatsBar({ count }: { count: number }) {
  const stats = [
    {
      icon: <Newspaper className="h-4 w-4 text-blue-500" />,
      value: count,
      label: "tin tức",
      bg: "bg-blue-50 dark:bg-blue-500/10",
    },
    {
      icon: <TrendingUp className="h-4 w-4 text-emerald-500" />,
      value: null,
      label: "Cập nhật mỗi tuần",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
    },
    {
      icon: <Sparkles className="h-4 w-4 text-amber-500" />,
      value: null,
      label: "Nội dung chuyên sâu",
      bg: "bg-amber-50 dark:bg-amber-500/10",
    },
    {
      icon: <Star className="h-4 w-4 text-indigo-500" />,
      value: null,
      label: "Được kiểm duyệt kỹ",
      bg: "bg-indigo-50 dark:bg-indigo-500/10",
    },
  ];

  return (
    <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s, i) => (
        <div
          key={i}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 ${s.bg}`}
        >
          <div className="shrink-0">{s.icon}</div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {s.value !== null && (
              <strong className="mr-1 text-slate-900 dark:text-white">
                {s.value}
              </strong>
            )}
            {s.label}
          </p>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------- */
/* Featured Post */
/* -------------------------------------------------- */

function FeaturedPost({ post }: { post: Post }) {
  return (
    <section className="mb-12">

      {/* Section label */}
      <div className="mb-4 flex items-center gap-2">
        <Flame className="h-4 w-4 text-orange-500" />
        <span className="text-xs font-bold uppercase tracking-widest text-orange-500">
          Nổi bật
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-orange-200 to-transparent dark:from-orange-900" />
      </div>

      <Link
        href={`/bai-viet/${post.slug}`}
        className="group relative block overflow-hidden rounded-2xl ring-2 ring-transparent transition hover:ring-blue-500/40"
      >
        {post.cover_image ? (
          <Image
            src={post.cover_image}
            alt={post.title}
            width={1200}
            height={600}
            priority
            className="h-[280px] w-full object-cover transition duration-700 group-hover:scale-105 sm:h-[360px] lg:h-[440px]"
          />
        ) : (
          <div className="relative h-[280px] bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 sm:h-[360px] lg:h-[440px]">
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <Newspaper className="h-32 w-32 text-white" />
            </div>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

        {/* Top-right badge */}
        <div className="absolute right-4 top-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
            <Flame className="h-3 w-3" />
            Nổi bật
          </span>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 w-full p-6 sm:p-8">
          <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl lg:text-3xl">
            {post.title}
          </h2>

          {post.excerpt && (
            <p className="mt-2 line-clamp-2 text-sm text-white/70">
              {post.excerpt}
            </p>
          )}

          <div className="mt-4 flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-3 text-xs text-white/60">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                Admin
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                {formatDate(post.created_at)}
              </span>
              {post.reading_time && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.reading_time} phút đọc
                  </span>
                </>
              )}
            </div>

            <span className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
              Đọc ngay
              <ArrowUpRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </Link>
    </section>
  );
}

/* -------------------------------------------------- */
/* Post Card */
/* -------------------------------------------------- */

const CARD_ACCENTS = [
  {
    bar: "bg-blue-500",
    badge: "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
    hover: "group-hover:text-blue-600 dark:group-hover:text-blue-400",
    readMore: "text-blue-600 dark:text-blue-400",
  },
  {
    bar: "bg-indigo-500",
    badge: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400",
    hover: "group-hover:text-indigo-600 dark:group-hover:text-indigo-400",
    readMore: "text-indigo-600 dark:text-indigo-400",
  },
  {
    bar: "bg-cyan-500",
    badge: "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-400",
    hover: "group-hover:text-cyan-600 dark:group-hover:text-cyan-400",
    readMore: "text-cyan-600 dark:text-cyan-400",
  },
  {
    bar: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
    hover: "group-hover:text-emerald-600 dark:group-hover:text-emerald-400",
    readMore: "text-emerald-600 dark:text-emerald-400",
  },
  {
    bar: "bg-amber-500",
    badge: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
    hover: "group-hover:text-amber-600 dark:group-hover:text-amber-400",
    readMore: "text-amber-600 dark:text-amber-400",
  },
  {
    bar: "bg-rose-500",
    badge: "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400",
    hover: "group-hover:text-rose-600 dark:group-hover:text-rose-400",
    readMore: "text-rose-600 dark:text-rose-400",
  },
];

function PostCard({ post, index }: { post: Post; index: number }) {
  const accent = CARD_ACCENTS[index % CARD_ACCENTS.length];

  return (
    <Link
      href={`/bai-viet/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
    >
      {/* Colored top bar */}
      <div className={`h-1 w-full shrink-0 ${accent.bar}`} />

      {/* Cover image */}
      {post.cover_image ? (
        <div className="overflow-hidden">
          <Image
            src={post.cover_image}
            alt={post.title}
            width={600}
            height={340}
            className="aspect-[16/9] w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="aspect-[16/9] flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
          <BookOpen className="h-10 w-10 text-slate-300 dark:text-slate-700" />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-3 p-5">

        {/* Meta row */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${accent.badge}`}
          >
            <CalendarDays className="h-3 w-3" />
            {formatDateShort(post.created_at)}
          </span>

          {post.reading_time && (
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <Clock className="h-3 w-3" />
              {post.reading_time} phút
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          className={`line-clamp-2 text-[15px] font-bold leading-snug text-slate-800 transition dark:text-slate-100 ${accent.hover}`}
        >
          {post.title}
        </h3>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="line-clamp-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {post.excerpt}
          </p>
        )}

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <User className="h-3.5 w-3.5" />
            Admin
          </span>

          <span
            className={`flex items-center gap-1 text-xs font-semibold opacity-0 transition group-hover:opacity-100 ${accent.readMore}`}
          >
            Đọc thêm
            <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </div>

      </div>
    </Link>
  );
}

/* -------------------------------------------------- */
/* Empty State */
/* -------------------------------------------------- */

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 py-28 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
        <Newspaper className="h-8 w-8 text-slate-400" />
      </div>
      <div>
        <p className="font-semibold text-slate-700 dark:text-slate-300">
          Chưa có tin tức nào
        </p>
        <p className="mt-1 text-sm text-slate-400">
          Quay lại sau nhé, nội dung đang được chuẩn bị!
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------- */
/* Page */
/* -------------------------------------------------- */

export default async function PostsPage() {
  const posts = await fetchPosts();
  const [featured, ...rest] = posts;

  return (
    <MainLayout>
      <main className="mx-auto max-w-7xl px-4 pb-28 pt-16 sm:pt-20 lg:pt-24">

        <PageHeader />

        <StatsBar count={posts.length} />

        {posts.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Featured */}
            {featured && <FeaturedPost post={featured} />}

            {/* Recent posts */}
            {rest.length > 0 && (
              <section>

                {/* Section header */}
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/15">
                    <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Tin tức gần đây
                  </h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent dark:from-slate-800" />
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    {rest.length} tin
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {rest.map((post, i) => (
                    <PostCard key={post.id} post={post} index={i} />
                  ))}
                </div>

              </section>
            )}
          </>
        )}

      </main>
    </MainLayout>
  );
}