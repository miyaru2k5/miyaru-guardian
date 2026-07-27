import type { MetadataRoute } from "next";
import { supabasePublic } from "@/lib/supabase-public";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_WEBSITE_URL ||
  "https://admin.miyaru.online";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/giao-dich-vien",
    "/contact",
    "/get-2fa",
    "/get-uid-fb",
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const { data: traders } = await supabasePublic
    .from("traders")
    .select("code, updated_at")
    .eq("status", "LIVE")
    .limit(500);

  const traderRoutes: MetadataRoute.Sitemap = (traders || []).map((t) => ({
    url: `${siteUrl}/${t.code}`,
    lastModified: t.updated_at ? new Date(t.updated_at) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...traderRoutes];
}
