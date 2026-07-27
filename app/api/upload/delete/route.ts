import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { clientIpFromHeaders, rateLimit } from "@/lib/rate-limit";
import { extractR2ObjectKey } from "@/lib/r2-helpers";
import { r2 } from "@/lib/r2";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const ip = clientIpFromHeaders(req.headers);
  const limited = rateLimit(`upload-delete:${ip}`, 30, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      }
    );
  }

  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: { url?: string };
  try {
    body = (await req.json()) as { url?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.url) {
    return NextResponse.json({ error: "Missing URL" }, { status: 400 });
  }

  const keyResult = extractR2ObjectKey(body.url);
  if (!keyResult.ok) {
    return NextResponse.json({ error: keyResult.error }, { status: 400 });
  }

  if (!process.env.R2_BUCKET_NAME) {
    return NextResponse.json(
      { error: "Storage is not configured" },
      { status: 500 }
    );
  }

  try {
    await r2.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: keyResult.key,
      })
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("R2 delete failed", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
