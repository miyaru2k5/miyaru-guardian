import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import GDVDetail from "@/components/GDVDetail";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL!;
const SITE_NAME = process.env.NEXT_PUBLIC_WEBSITE_TITLE!;
const SITE_DOMAIN = process.env.NEXT_PUBLIC_WEBSITE_DOMAIN!;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const { data: trader } = await supabase
    .from("traders")
    .select("name, insurance_fund, description, avatar_url, slug, banner_url")
    .eq("slug", slug)
    .maybeSingle();

  if (!trader) {
    return {
      title: "Không tìm thấy GDV",
      description: "Giao dịch viên không tồn tại hoặc đã bị xóa.",
    };
  }

  const fund = Number(trader.insurance_fund).toLocaleString("vi-VN");

  const title = `Quỹ bảo hiểm: ${fund}đ - ${trader.name} - Tại ${SITE_DOMAIN}`;

  const description =
    trader.description?.slice(0, 160) ||
    `${trader.name} — Giao dịch viên đã được xác thực. Quỹ bảo hiểm: ${fund}đ`;

const imageUrl =
  trader.banner_url || trader.avatar_url || `${SITE_URL}/seo-preview.png`;

  const pageUrl = `${SITE_URL}/${trader.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: SITE_NAME,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: trader.name,
        },
      ],
      type: "profile",
      locale: "vi_VN",
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default function TraderDetailPage() {
  return <GDVDetail />;
}
