import { FileText, ChevronDown } from "lucide-react";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { sanitizeHtml } from "@/lib/sanitizeHtml";
import type { TermsPage } from "@/types/terms";

const getExcerpt = (html: string, maxLength = 120): string => {
  const text = html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

const SystemTermsSection: React.FC = () => {
  const [items, setItems] = useState<TermsPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const { data } = await supabase
        .from("terms_pages")
        .select("id,title,slug,content,display_order,is_published")
        .eq("is_published", true)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: true });

      setItems((data as TermsPage[]) || []);
      setLoading(false);
    };

    load();
  }, []);

  if (!loading && !items.length) return null;

  const toggleOpen = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Điều khoản <span className="text-gradient">hệ thống</span>
          </h2>

          <p className="text-muted-foreground max-w-xl mx-auto">
            Các điều khoản và chính sách sử dụng dịch vụ
          </p>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 bg-card/40 border border-border animate-pulse h-[140px]"
              />
            ))}
          </div>
        )}

        {/* Terms */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {!loading &&
            items.map((t, index) => {
              const isOpen = openId === t.id;
              const safeHtml = sanitizeHtml(t.content || "");

              return (
                <div
                  key={t.id}
                  className={`group rounded-2xl border border-border bg-card/60 transition-all duration-300 hover:border-primary/30 hover:bg-card/80 animate-fade-in-up ${
                    isOpen ? "shadow-lg" : ""
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Header */}
                  <button
                    type="button"
                    onClick={() => toggleOpen(t.id)}
                    className="w-full p-6 text-left"
                  >
                    <div className="flex items-start gap-3">

                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>

                      <div className="flex-1 min-w-0">

                        <div className="flex items-center justify-between gap-4">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {t.title}
                          </h3>

                          <ChevronDown
                            className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
                              isOpen ? "rotate-180 text-primary" : ""
                            }`}
                          />
                        </div>

                        {!isOpen && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {getExcerpt(t.content || "") || "Xem chi tiết..."}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Content */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      isOpen ? "max-h-[500px]" : "max-h-0"
                    }`}
                  >
                    <div
                      className="px-6 pb-6 text-sm text-muted-foreground prose prose-sm max-w-none 
                      [&_h2]:text-base [&_h2]:font-semibold
                      [&_ul]:list-disc [&_ul]:pl-6
                      [&_p]:mb-2"
                      dangerouslySetInnerHTML={{ __html: safeHtml }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </section>
  );
};

export default SystemTermsSection;