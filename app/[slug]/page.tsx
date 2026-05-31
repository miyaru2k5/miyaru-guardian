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

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Strip JSON description (DescSection[]) down to plain text for meta tags.
 * Falls back gracefully if it's already plain text or invalid JSON.
 */
function extractPlainDescription(raw: string | null | undefined): string {
  if (!raw?.trim()) return "";
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed
        .flatMap((sec: { title?: string; items?: { text: string }[] }) => [
          sec.title ?? "",
          ...(sec.items ?? []).map((it) => it.text),
        ])
        .filter(Boolean)
        .join(" • ");
    }
  } catch {
    // plain text — use as-is
  }
  return raw;
}

function formatCurrency(amount: number): string {
  return Number(amount).toLocaleString("vi-VN");
}

// ── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const { data: trader } = await supabase
    .from("traders")
    .select(
      "name, insurance_fund, description, avatar_url, slug, banner_url, status, service, success_rate, code"
    )
    .eq("slug", slug)
    .eq("status", "LIVE") // ← only index live traders
    .maybeSingle();

  if (!trader) {
    return {
      title: "Không tìm thấy GDV",
      description: "Giao dịch viên không tồn tại hoặc đã bị ẩn.",
      robots: { index: false, follow: false }, // ← don't index 404-like pages
    };
  }

  const fund = formatCurrency(Number(trader.insurance_fund));
  const pageUrl = `${SITE_URL}/${trader.slug}`;

  const title = `${trader.name} — Quỹ bảo hiểm ${fund}đ | ${SITE_DOMAIN}`;

  const plainDesc = extractPlainDescription(trader.description);
  const description = plainDesc
    ? plainDesc.slice(0, 155)
    : `${trader.name} — Giao dịch viên đã xác thực tại ${SITE_DOMAIN}. Quỹ bảo hiểm: ${fund}đ. Tỷ lệ thành công: ${trader.success_rate}%.`;

  // Prefer banner (1200×630 landscape) for OG, fall back to avatar then default
  const ogImage =
    trader.banner_url || trader.avatar_url || `${SITE_URL}/seo-preview.png`;

  return {
    title,
    description,

    // ── Canonical ────────────────────────────────────────────────────────────
    alternates: {
      canonical: pageUrl,
    },

    // ── Robots ───────────────────────────────────────────────────────────────
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },

    // ── Open Graph ───────────────────────────────────────────────────────────
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: SITE_NAME,
      locale: "vi_VN",
      type: "profile",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${trader.name} — ${SITE_DOMAIN}`,
        },
      ],
    },

    // ── Twitter/X card ───────────────────────────────────────────────────────
    twitter: {
      card: "summary_large_image", // ← dùng large để hiển thị banner đẹp hơn
      title,
      description,
      images: [ogImage],
    },
  };
}

// ── JSON-LD Structured Data ───────────────────────────────────────────────────

async function TraderJsonLd({ slug }: { slug: string }) {
  const { data: trader } = await supabase
    .from("traders")
    .select(
      "name, insurance_fund, description, avatar_url, slug, banner_url, status, service, success_rate, created_at, facebook, website"
    )
    .eq("slug", slug)
    .eq("status", "LIVE")
    .maybeSingle();

  if (!trader) return null;

  const pageUrl = `${SITE_URL}/${trader.slug}`;
  const plainDesc = extractPlainDescription(trader.description);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: trader.name,
    url: pageUrl,
    image: trader.avatar_url || trader.banner_url || undefined,
    description: plainDesc?.slice(0, 300) || undefined,
    jobTitle: trader.service || "Giao dịch viên",
    worksFor: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    sameAs: [
      trader.facebook
        ? trader.facebook.startsWith("http")
          ? trader.facebook
          : `https://www.facebook.com/${trader.facebook}`
        : null,
      trader.website
        ? trader.website.startsWith("http")
          ? trader.website
          : `https://${trader.website}`
        : null,
    ].filter(Boolean),
    // AggregateRating giúp Google hiển thị star snippet
    aggregateRating: trader.success_rate
      ? {
          "@type": "AggregateRating",
          ratingValue: (Number(trader.success_rate) / 20).toFixed(1), // convert 0-100 → 0-5
          bestRating: "5",
          worstRating: "1",
          ratingCount: "1",
        }
      : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function TraderDetailPage({ params }: Props) {
  const { slug } = await params;

  return (
    <>
      <TraderJsonLd slug={slug} />
      <GDVDetail />
    </>
  );
}