import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { sanitizeHtml } from "@/lib/sanitizeHtml";
import type { TermsPage } from "@/types/terms";

const UserTermsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [term, setTerm] = useState<TermsPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("terms_pages")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      setTerm((data as TermsPage) || null);
      setLoading(false);
    };
    load();
  }, [slug]);

  const safeHtml = term ? sanitizeHtml(term.content) : "";

  return (
    <main className="min-h-screen bg-background text-foreground px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {loading && (
          <div className="space-y-4">
            <div className="h-8 w-2/3 bg-card rounded-lg animate-pulse" />
            <div className="h-4 w-full bg-card rounded-lg animate-pulse" />
            <div className="h-4 w-5/6 bg-card rounded-lg animate-pulse" />
          </div>
        )}

        {!loading && !term && (
          <p className="text-sm text-muted-foreground">Không tìm thấy điều khoản.</p>
        )}

        {term && (
          <div className="rounded-2xl border border-border bg-card/60 p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-foreground">{term.title}</h1>
            <article
              className="text-foreground/90 leading-relaxed text-sm md:text-base space-y-4 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-6 [&_p]:text-muted-foreground [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-muted-foreground [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:text-muted-foreground [&_li]:my-1"
              dangerouslySetInnerHTML={{ __html: safeHtml }}
            />
          </div>
        )}
      </div>
    </main>
  );
};

export default UserTermsPage;

