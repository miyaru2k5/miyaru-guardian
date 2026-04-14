import Link from "next/link";
import Image from "next/image";
import { Link2, LayoutGrid, Tag } from "lucide-react";
import type { Post } from "@/types/posts";

export interface CategoryStat {
  name: string;
  count: number;
}

interface BlogSidebarProps {
  relatedPosts: Post[];
  categories: CategoryStat[];
  tags: string[];
}

const BlogSidebar = ({ relatedPosts, categories, tags }: BlogSidebarProps) => {
  return (
    <aside className="w-full lg:w-[30%] shrink-0 space-y-8">
      {/* 1. Bài viết liên quan */}
      {relatedPosts && relatedPosts.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-[#16141c]/50 p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <Link2 className="h-5 w-5 text-pink-500" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Bài viết liên quan</h3>
          </div>
          <div className="space-y-5">
            {relatedPosts.map((post) => (
              <Link key={post.id} href={`/bai-viet/${post.slug}`} className="group flex items-start gap-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white/5">
                  {post.cover_image ? (
                    <Image
                      src={post.cover_image}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                      sizes="64px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-white/5 text-pink-500">
                      <Link2 className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="line-clamp-2 text-sm font-medium leading-snug text-gray-300 transition-colors group-hover:text-pink-400">
                    {post.title}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {new Date(post.created_at).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric"
                    })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 2. Danh mục */}
      {categories && categories.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-[#16141c]/50 p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <LayoutGrid className="h-5 w-5 text-pink-500" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Danh mục</h3>
          </div>
          <ul className="space-y-3">
            {categories.map((cat, i) => (
              <li key={i}>
                <Link
                  href={`/bai-viet?category=${encodeURIComponent(cat.name)}`}
                  className="group flex items-center justify-between rounded-xl px-3 py-2 text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <span className="truncate">{cat.name}</span>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-500/20 text-[10px] font-bold text-pink-400 transition-colors group-hover:bg-pink-500 group-hover:text-white">
                    {cat.count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 3. Tags */}
      {tags && tags.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-[#16141c]/50 p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <Tag className="h-5 w-5 text-pink-500" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Tags</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, i) => (
              <Link
                key={i}
                href={`/bai-viet?tag=${encodeURIComponent(tag)}`}
                className="rounded-full border border-pink-500/30 bg-pink-500/10 px-3 py-1.5 text-[11px] font-medium tracking-wide text-pink-400 transition-colors hover:border-pink-500/60 hover:bg-pink-500/20 hover:text-pink-300"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};

export default BlogSidebar;
