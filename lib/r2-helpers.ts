/**
 * Extract object key from a public R2 URL. Rejects path traversal and foreign hosts.
 */
export function extractR2ObjectKey(
  rawUrl: string,
  publicBaseUrl?: string
): { ok: true; key: string } | { ok: false; error: string } {
  if (rawUrl.includes("..") || rawUrl.includes("\\") || rawUrl.includes("%2e%2e")) {
    return { ok: false, error: "Invalid object key" };
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { ok: false, error: "Invalid URL" };
  }

  if (parsed.protocol !== "https:") {
    return { ok: false, error: "Only HTTPS URLs are allowed" };
  }

  const base = publicBaseUrl || process.env.R2_PUBLIC_URL || "";
  if (base) {
    try {
      const baseUrl = new URL(base);
      if (parsed.hostname !== baseUrl.hostname) {
        return { ok: false, error: "URL host does not match R2 public host" };
      }
    } catch {
      // fall through to public domain check
    }
  }

  const publicDomain = process.env.NEXT_PUBLIC_R2_DOMAIN;
  if (publicDomain && parsed.hostname !== publicDomain) {
    return { ok: false, error: "URL host does not match R2 public host" };
  }

  const key = decodeURIComponent(parsed.pathname.replace(/^\/+/, ""));
  if (!key || key.includes("..") || key.includes("\\") || key.includes("/")) {
    // Only allow single-segment object keys uploaded by this app
    return { ok: false, error: "Invalid object key" };
  }

  return { ok: true, key };
}
