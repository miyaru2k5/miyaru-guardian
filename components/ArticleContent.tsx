import Image from "next/image";
import type { PostImage } from "@/types/posts";

interface ArticleContentProps {
  sections?: PostImage[];
}

const ArticleContent = ({ sections }: ArticleContentProps) => {
  if (!sections || !sections.length) {
    return (
      <div className="prose max-w-none text-slate-700 dark:text-slate-200">
        <p>Đang cập nhật nội dung chi tiết.</p>
      </div>
    );
  }

  const sortedSections = [...sections].sort((a, b) => (a.image_order ?? 0) - (b.image_order ?? 0));

  return (
    <div className="space-y-10">
      {sortedSections.map((section) => (
        <section key={section.id} id={`section-${section.image_order}`}>
          {section.title && (
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{section.title}</h2>
          )}
          {section.content && (
            <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">{section.content}</p>
          )}
          {section.image_url && (
            <div className="relative mt-6 h-[320px] w-full overflow-hidden rounded-2xl bg-slate-100">
              <Image
                src={section.image_url}
                alt={section.alt_text ?? section.title ?? "Hình ảnh Tin tức"}
                fill
                className="object-cover"
              />
            </div>
          )}
          {section.caption && <p className="mt-2 text-xs text-muted-foreground">{section.caption}</p>}
        </section>
      ))}
    </div>
  );
};

export default ArticleContent;
