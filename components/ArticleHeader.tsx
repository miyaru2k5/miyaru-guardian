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
      {/* Category Tag */}
      <div className="inline-flex">
        <span className="rounded-full bg-pink-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-pink-500 ring-1 ring-inset ring-pink-500/20">
          {post.category ?? "Chuyên mục"}
        </span>
      </div>

      <div>
        <h1 className="text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl">
          {post.title}
        </h1>
        {post.excerpt && <p className="mt-4 text-lg text-gray-400">{post.excerpt}</p>}
      </div>

      <div className="flex items-center gap-3 text-sm text-gray-400">
        <div className="relative h-8 w-8 overflow-hidden rounded-full bg-[#16141c] ring-1 ring-white/10">
          {post.author_avatar ? (
            <Image src={post.author_avatar} alt={post.author_name ?? "Tác giả"} fill className="object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-gray-500">
              {post.author_name?.charAt(0) ?? "M"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2.5">
          <span className="font-medium text-white">{post.author_name ?? "Đội ngũ Admin"}</span>
          <span className="h-1 w-1 rounded-full bg-gray-600"></span>
          <span>{formattedDate}</span>
          <span className="h-1 w-1 rounded-full bg-gray-600"></span>
          <span>{readingTime}</span>
        </div>
      </div>
    </header>
  );
};

export default ArticleHeader;