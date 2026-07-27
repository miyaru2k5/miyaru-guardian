/** Block private / link-local / metadata hosts to reduce SSRF risk. */
const BLOCKED_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^0\./,
  /^169\.254\./,
  /^\[?::1\]?$/i,
  /^metadata\.google\.internal$/i,
  /^metadata$/i,
];

export function isPrivateOrBlockedHostname(hostname: string): boolean {
  const host = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  return BLOCKED_HOST_PATTERNS.some((re) => re.test(host));
}

export function parsePublicHttpsUrl(
  raw: string,
  allowedHosts?: readonly string[]
): { ok: true; url: URL } | { ok: false; error: string } {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { ok: false, error: "Invalid URL" };
  }

  if (url.protocol !== "https:") {
    return { ok: false, error: "Only HTTPS URLs are allowed" };
  }

  if (isPrivateOrBlockedHostname(url.hostname)) {
    return { ok: false, error: "Host not allowed" };
  }

  if (allowedHosts && allowedHosts.length > 0) {
    const allowed = allowedHosts.some(
      (h) =>
        url.hostname === h ||
        url.hostname.endsWith(`.${h}`)
    );
    if (!allowed) {
      return { ok: false, error: "Host not in allowlist" };
    }
  }

  return { ok: true, url };
}
