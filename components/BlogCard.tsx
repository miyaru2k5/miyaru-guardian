import Link from "next/link";
import Image from "next/image";
import type { Post } from "@/types/posts";

interface BlogCardProps {
  post: Post;
}

const BlogCard = ({ post }: BlogCardProps) => {
  const publishedDate = new Date(post.created_at).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const readingTime = post.reading_time ? `${post.reading_time} min đọc` : "Đọc nhanh";

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/60 bg-white/90 shadow-lg shadow-slate-900/5 transition hover:-translate-y-[2px] hover:bg-white/95 dark:bg-slate-900 dark:border-slate-800">
      {post.cover_image ? (
        <Link
          href={`/bai-viet/${post.slug}`}
          className="relative block h-56 w-full overflow-hidden rounded-t-3xl bg-slate-100"
        >
          <Image
            src={post.cover_image}
            alt={post.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent" />
        </Link>
      ) : (
        <div className="h-56 rounded-t-3xl bg-gradient-to-br from-slate-900 via-slate-700 to-slate-900" />
      )}

      <div className="flex h-full flex-col gap-3 p-6">
        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span>{post.category ?? "Chung"}</span>
          <span className="text-slate-400">•</span>
          <span>{readingTime}</span>
        </div>

        <Link href={`/bai-viet/${post.slug}`} className="space-y-2">
          <h3 className="text-xl font-semibold leading-snug text-slate-900 transition group-hover:text-primary dark:text-white">
            {post.title}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{post.excerpt ?? "Không có mô tả..."}</p>
        </Link>

        <div className="mt-auto flex items-center justify-between text-xs text-slate-500">
          <span>{publishedDate}</span>
          <span>{post.views.toLocaleString()} lượt xem</span>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;
