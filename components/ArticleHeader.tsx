import Image from "next/image";
import type { Post } from "@/types/posts";

interface ArticleHeaderProps {
  post: Post;
}

const ArticleHeader = ({ post }: ArticleHeaderProps) => {
  const formattedDate = new Date(post.created_at).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const readingTime = post.reading_time ? `${post.reading_time} phút đọc` : "Đọc nhanh";

  return (
    <header className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        <span>{post.category ?? "Chuyên mục"}</span>
        <span className="text-slate-400">•</span>
        <span>{readingTime}</span>
        <span className="text-slate-400">•</span>
        <span>{post.views.toLocaleString()} lượt xem</span>
      </div>

      <div>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white md:text-4xl">{post.title}</h1>
        {post.excerpt && <p className="mt-3 text-lg text-slate-600 dark:text-slate-300">{post.excerpt}</p>}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative h-11 w-11 overflow-hidden rounded-full bg-slate-200">
          {post.author_avatar ? (
            <Image src={post.author_avatar} alt={post.author_name ?? "Tác giả"} fill className="object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-500">
              {post.author_name?.charAt(0) ?? "M"}
            </span>
          )}
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-300">
          <p className="font-semibold text-slate-900 dark:text-white">{post.author_name ?? "Đội ngũ Miyaru"}</p>
          <p>{formattedDate}</p>
        </div>
      </div>
    </header>
  );
};

export default ArticleHeader;
