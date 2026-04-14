import Image from "next/image";
import type { PostImage } from "@/types/posts";

interface ArticleContentProps {
  sections?: PostImage[];
}

const ArticleContent = ({ sections }: ArticleContentProps) => {
  if (!sections || !sections.length) {
    return (
      <div className="prose prose-invert max-w-none text-gray-300">
        <p>Đang cập nhật nội dung chi tiết.</p>
      </div>
    );
  }

  const sortedSections = [...sections].sort((a, b) => (a.image_order ?? 0) - (b.image_order ?? 0));

  return (
    <div className="space-y-12">
      {sortedSections.map((section, index) => (
        <section key={section.id} id={`section-${section.image_order}`} className="space-y-6">
          
          {/* Sub-heading / Title */}
          {section.title && (
            <div className="space-y-2">
              <span className="block text-[11px] font-bold uppercase tracking-widest text-pink-500">
                {String(index + 1).padStart(2, "0")} — MỤC CHÍNH
              </span>
              <h2 className="text-2xl font-bold leading-tight text-white">{section.title}</h2>
            </div>
          )}

          {/* Text Content */}
          {section.content && (
            <div className="prose prose-invert max-w-none">
              {section.content.split('\n\n').map((paragraph, pIdx) => {
                const isHighlight = pIdx === 0 && index === 0; // Highlight first paragraph
                
                if (isHighlight) {
                  return (
                    <div key={pIdx} className="mb-6 rounded-r-2xl border-l-2 border-pink-500 bg-pink-500/5 px-6 py-5">
                      <p className="m-0 text-base leading-relaxed text-gray-300 italic">
                        {paragraph}
                      </p>
                    </div>
                  );
                }

                // If paragraph is a quote or info box
                if (paragraph.startsWith('> ')) {
                  return (
                    <div key={pIdx} className="my-6 rounded-r-2xl border-l-2 border-red-500 bg-red-950/20 px-6 py-4">
                      <p className="m-0 text-sm leading-relaxed text-gray-300">
                        {paragraph.replace(/^> /, '')}
                      </p>
                    </div>
                  );
                }

                return (
                  <p key={pIdx} className="text-base leading-loose text-gray-300">
                    {paragraph}
                  </p>
                );
              })}
            </div>
          )}

          {/* Image */}
          {section.image_url && (
            <figure className="mt-8">
              <div className="relative w-full overflow-hidden rounded-2xl ring-1 ring-white/10">
                <div className="relative aspect-[16/9] w-full">
                  <Image
                    src={section.image_url}
                    alt={section.alt_text ?? section.title ?? "Hình ảnh Tin tức"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 800px"
                  />
                </div>
              </div>
              {section.caption && (
                <figcaption className="mt-3 text-center text-xs text-gray-500 italic">
                  {section.caption}
                </figcaption>
              )}
            </figure>
          )}
        </section>
      ))}
    </div>
  );
};

export default ArticleContent;