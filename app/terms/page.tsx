import Link from "next/link";
import MainLayout from "@/layouts/MainLayout";
import { supabase } from "@/lib/supabase";

const TermsIndexPage = async () => {
  const { data } = await supabase
    .from("terms_pages")
    .select("id, title, slug, display_order")
    .eq("is_published", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  return (
    <MainLayout>
      <main className="min-h-screen bg-background text-foreground px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-6">
          <header>
            <h1 className="text-3xl font-bold mb-2">Điều khoản</h1>
            <p className="text-muted-foreground text-sm">
              Danh sách các điều khoản đã được xuất bản.
            </p>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data?.map((term) => (
              <Link
                key={term.id}
                href={`/terms/${term.slug}`}
                className="block rounded-2xl border border-border bg-card/70 p-5 hover:border-primary hover:shadow-[0_0_20px_hsla(330,100%,55%,0.2)] transition"
              >
                <p className="text-lg font-semibold text-foreground">{term.title}</p>
                <p className="text-xs text-muted-foreground mt-2">Slug: {term.slug}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </MainLayout>
  );
};

export default TermsIndexPage;
