import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import GDVDetail from "@/components/GDVDetail";

// Supabase server-side client (không cần auth)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface Props {
  params: Promise<{ slug: string }>;
}

// ── generateMetadata: chạy server-side, tạo OG tags cho preview ──────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: trader } = await supabase
    .from("traders")
    .select("name, insurance_fund, description, avatar_url, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (!trader) {
    return {
      title: "Không tìm thấy GDV",
      description: "Giao dịch viên không tồn tại hoặc đã bị xóa.",
    };
  }

  const fund = Number(trader.insurance_fund).toLocaleString("vi-VN");
  const title = `Quỹ bảo hiểm: ${fund}đ - ${trader.name}`;
  const description =
    trader.description?.slice(0, 160) ||
    `${trader.name} — Giao dịch viên đã được xác thực. Quỹ bảo hiểm: ${fund}đ`;

  // URL tuyệt đối cho ảnh OG
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://admin.miyaru.online";
  const imageUrl = trader.avatar_url || `${baseUrl}/seo-preview.png`;
  const pageUrl = `${baseUrl}/${trader.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: "Miyaru Guardian",
      images: [
        {
          url: imageUrl,
          width: 400,
          height: 400,
          alt: trader.name,
        },
      ],
      type: "profile",
      locale: "vi_VN",
    },
    // Zalo & Messenger dùng OG tags — không cần thêm gì
    twitter: {
      card: "summary",
      title,
      description,
      images: [imageUrl],
    },
  };
}

// ── Page component ────────────────────────────────────────────────────────────
export default function TraderDetailPage() {
  return <GDVDetail />;
}