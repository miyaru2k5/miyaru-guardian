import { FileText } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
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

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Điều khoản <span className="text-gradient">hệ thống</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Các điều khoản, chính sách sử dụng dịch vụ của chúng tôi
          </p>
        </div>

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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {!loading &&
            items.map((t, index) => (
              <Link
                key={t.id}
                to={`/dieu-khoan/${t.slug}`}
                className="group relative rounded-2xl p-6 bg-card/60 border border-border hover:border-primary/30 hover:bg-card/80 transition-all text-left card-hover animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {t.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {getExcerpt(t.content || "") || "Xem chi tiết..."}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </section>
  );
};

export default SystemTermsSection;

