import { type NextRequest, NextResponse } from "next/server";
import { clientIpFromHeaders, rateLimit } from "@/lib/rate-limit";
import { parsePublicHttpsUrl } from "@/lib/url-safety";

export const runtime = "nodejs";

const FACEBOOK_HOSTS = [
  "facebook.com",
  "www.facebook.com",
  "m.facebook.com",
  "fb.com",
  "www.fb.com",
  "fb.me",
  "www.fb.me",
] as const;

export async function POST(req: NextRequest) {
  const ip = clientIpFromHeaders(req.headers);
  const limited = rateLimit(`get-uid:${ip}`, 20, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { status: "error", msg: "Quá nhiều yêu cầu. Thử lại sau." },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      }
    );
  }

  let body: { url?: string };
  try {
    body = (await req.json()) as { url?: string };
  } catch {
    return NextResponse.json(
      { status: "error", msg: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (!body.url) {
    return NextResponse.json(
      { status: "error", msg: "Thiếu URL facebook" },
      { status: 400 }
    );
  }

  const parsed = parsePublicHttpsUrl(body.url);
  if (!parsed.ok) {
    return NextResponse.json(
      { status: "error", msg: parsed.error },
      { status: 400 }
    );
  }

  const hostOk = FACEBOOK_HOSTS.some(
    (h) =>
      parsed.url.hostname === h ||
      parsed.url.hostname.endsWith(".facebook.com")
  );
  if (!hostOk) {
    return NextResponse.json(
      { status: "error", msg: "Chỉ hỗ trợ link Facebook" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch("https://likenhanh.pro/api/get_uid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: parsed.url.toString() }),
      signal: AbortSignal.timeout(15_000),
    });

    const data = (await res.json()) as {
      status?: string;
      uid?: string;
      msg?: string;
    };

    // Preserve legacy client contract used by lib/getFbUid.ts
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({
      status: "error",
      msg: "Không thể lấy UID",
    });
  }
}
