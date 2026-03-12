import { notFound } from "next/navigation";
import MainLayout from "@/layouts/MainLayout";
import { supabase } from "@/lib/supabase";
import { sanitizeHtml } from "@/lib/sanitizeHtml";
import type { TermsPage } from "@/types/terms";

type Props = {
  params: { slug: string };
};

const TermsDetailPage = async ({ params }: Props) => {
  const { slug } = params;
  const { data } = await supabase
    .from("terms_pages")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!data) {
    notFound();
  }

  const safeHtml = sanitizeHtml((data as TermsPage).content);

  return (
    <MainLayout>
      <main className="min-h-screen bg-background text-foreground px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl border border-border bg-card/60 p-6 md:p-8 space-y-4">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-foreground">{(data as TermsPage).title}</h1>
            <article
              className="text-foreground/90 leading-relaxed text-sm md:text-base space-y-4 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-6 [&_p]:text-muted-foreground [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-muted-foreground [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:text-muted-foreground [&_li]:my-1"
              dangerouslySetInnerHTML={{ __html: safeHtml }}
            />
          </div>
        </div>
      </main>
    </MainLayout>
  );
};

export default TermsDetailPage;
