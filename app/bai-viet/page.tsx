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
/* Fetch Posts                                        */
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
/* Helpers                                            */
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
/* Page Header                                        */
/* -------------------------------------------------- */

function PageHeader() {
  return (
    <div className="relative mb-10 mt-6 overflow-hidden rounded-3xl bg-card px-8 py-16 sm:px-14 sm:py-20">

      {/* Animated orbs — dùng màu primary & accent từ theme */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-80 w-80 animate-pulse rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -bottom-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div
          className="absolute -right-20 top-10 h-64 w-64 animate-pulse rounded-full bg-accent/20 blur-3xl"
          style={{ animationDelay: "1.5s" }}
        />

        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,currentColor 0,currentColor 1px,transparent 1px,transparent 56px),repeating-linear-gradient(90deg,currentColor 0,currentColor 1px,transparent 1px,transparent 56px)",
          }}
        />

        {/* Border glows — dùng primary */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col gap-6">

        {/* Top badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            Live · Cập nhật liên tục
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent-foreground">
            <Rss className="h-3 w-3" />
            Admin News
          </span>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Tin tức &amp;{" "}
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Kiến thức
            </span>
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
            Tổng hợp chuyên sâu, tin tức mới nhất và những chia sẻ thực tế
            từ đội ngũ{" "}
            <span className="font-semibold text-foreground">Admin</span>.
          </p>
        </div>

        {/* Stat chips — primary / accent / secondary */}
        <div className="flex flex-wrap gap-3 pt-2">
          {[
            {
              icon: <Layers className="h-3.5 w-3.5" />,
              label: "Chuyên sâu",
              color: "text-primary border-primary/30 bg-primary/10",
            },
            {
              icon: <Zap className="h-3.5 w-3.5" />,
              label: "Thực tế",
              color: "text-accent-foreground border-accent/30 bg-accent/10",
            },
            {
              icon: <BarChart2 className="h-3.5 w-3.5" />,
              label: "Có số liệu",
              color: "text-primary border-primary/20 bg-primary/[0.07]",
            },
            {
              icon: <CalendarDays className="h-3.5 w-3.5" />,
              label: "Mỗi tuần",
              color: "text-muted-foreground border-border bg-secondary",
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
/* Stats Bar                                          */
/* -------------------------------------------------- */

function StatsBar({ count }: { count: number }) {
  const stats = [
    {
      icon: <Newspaper className="h-4 w-4 text-primary" />,
      value: count,
      label: "tin tức",
      bg: "bg-primary/10",
    },
    {
      icon: <TrendingUp className="h-4 w-4 text-primary" />,
      value: null,
      label: "Cập nhật mỗi tuần",
      bg: "bg-primary/[0.07]",
    },
    {
      icon: <Sparkles className="h-4 w-4 text-accent-foreground" />,
      value: null,
      label: "Nội dung chuyên sâu",
      bg: "bg-accent/10",
    },
    {
      icon: <Star className="h-4 w-4 text-muted-foreground" />,
      value: null,
      label: "Được kiểm duyệt kỹ",
      bg: "bg-secondary",
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
          <p className="text-sm font-medium text-foreground">
            {s.value !== null && (
              <strong className="mr-1 text-foreground">
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
/* Featured Post                                      */
/* -------------------------------------------------- */

function FeaturedPost({ post }: { post: Post }) {
  return (
    <section className="mb-12">

      {/* Section label */}
      <div className="mb-4 flex items-center gap-2">
        <Flame className="h-4 w-4 text-primary" />
        <span className="text-xs font-bold uppercase tracking-widest text-primary">
          Nổi bật
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
      </div>

      <Link
        href={`/bai-viet/${post.slug}`}
        className="group relative block overflow-hidden rounded-2xl ring-2 ring-transparent transition hover:ring-primary/40"
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
          <div className="relative h-[280px] bg-gradient-to-br from-card via-background to-card sm:h-[360px] lg:h-[440px]">
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <Newspaper className="h-32 w-32 text-foreground" />
            </div>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

        {/* Top-right badge — dùng primary */}
        <div className="absolute right-4 top-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-lg">
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
/* Post Card                                          */
/* Màu accent xoay vòng giữa primary & accent/secondary */
/* -------------------------------------------------- */

const CARD_ACCENTS = [
  {
    bar: "bg-primary",
    badge: "bg-primary/10 text-primary",
    hover: "group-hover:text-primary",
    readMore: "text-primary",
  },
  {
    bar: "bg-accent",
    badge: "bg-accent/10 text-accent-foreground",
    hover: "group-hover:text-accent-foreground",
    readMore: "text-accent-foreground",
  },
  {
    bar: "bg-primary/70",
    badge: "bg-primary/[0.07] text-primary",
    hover: "group-hover:text-primary",
    readMore: "text-primary",
  },
  {
    bar: "bg-accent/80",
    badge: "bg-accent/[0.07] text-accent-foreground",
    hover: "group-hover:text-accent-foreground",
    readMore: "text-accent-foreground",
  },
  {
    bar: "bg-primary/90",
    badge: "bg-primary/10 text-primary",
    hover: "group-hover:text-primary",
    readMore: "text-primary",
  },
  {
    bar: "bg-accent/90",
    badge: "bg-accent/10 text-accent-foreground",
    hover: "group-hover:text-accent-foreground",
    readMore: "text-accent-foreground",
  },
];

function PostCard({ post, index }: { post: Post; index: number }) {
  const accent = CARD_ACCENTS[index % CARD_ACCENTS.length];

  return (
    <Link
      href={`/bai-viet/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Colored top bar — primary / accent xoay vòng */}
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
        <div className="aspect-[16/9] flex items-center justify-center bg-secondary">
          <BookOpen className="h-10 w-10 text-muted-foreground/40" />
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
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              {post.reading_time} phút
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          className={`line-clamp-2 text-[15px] font-bold leading-snug text-foreground transition ${accent.hover}`}
        >
          {post.title}
        </h3>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>
        )}

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
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
/* Empty State                                        */
/* -------------------------------------------------- */

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 py-28 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
        <Newspaper className="h-8 w-8 text-muted-foreground" />
      </div>
      <div>
        <p className="font-semibold text-foreground">
          Chưa có tin tức nào
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Quay lại sau nhé, nội dung đang được chuẩn bị!
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------- */
/* Page                                               */
/* -------------------------------------------------- */

export default async function PostsPage() {
  const posts = await fetchPosts();
  const [featured, ...rest] = posts;

  return (
    <MainLayout>
      {/* mt-6: margin-top so content clears the fixed navbar */}
      <main className="mx-auto mt-6 max-w-7xl px-4 pb-28 pt-16 sm:pt-20 lg:pt-24">

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
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                    Tin tức gần đây
                  </h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
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