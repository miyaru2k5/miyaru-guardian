import { PutObjectCommand } from "@aws-sdk/client-s3";
import { type NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { requireAdmin } from "@/lib/api-auth";
import { clientIpFromHeaders, rateLimit } from "@/lib/rate-limit";
import { r2 } from "@/lib/r2";

export const runtime = "nodejs";

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/tiff",
] as const;

export async function POST(req: NextRequest) {
  const ip = clientIpFromHeaders(req.headers);
  const limited = rateLimit(`upload:${ip}`, 30, 60_000);
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

  if (!process.env.R2_BUCKET_NAME || !process.env.R2_PUBLIC_URL) {
    return NextResponse.json(
      { error: "Storage is not configured" },
      { status: 500 }
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  const optimize = formData.get("optimize") !== "false";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "Chỉ hỗ trợ file ảnh" },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File quá lớn. Tối đa 10 MB" },
      { status: 413 }
    );
  }

  const originalBuffer = Buffer.from(await file.arrayBuffer());
  const baseName =
    file.name
      .replace(/\.[^.]+$/, "")
      .replace(/[^\w\-]+/g, "-")
      .slice(0, 80) || "image";

  let uploadBuffer: Buffer;
  let contentType: string;
  let ext: string;

  if (
    optimize &&
    (SUPPORTED_IMAGE_TYPES as readonly string[]).includes(file.type)
  ) {
    uploadBuffer = await sharp(originalBuffer)
      .resize(1920, 1080, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toBuffer();
    contentType = "image/webp";
    ext = "webp";
  } else {
    uploadBuffer = originalBuffer;
    contentType = file.type;
    const parts = file.name.split(".");
    ext =
      (parts[parts.length - 1] || "jpg")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "") || "jpg";
  }

  const fileName = `${Date.now()}-${baseName}.${ext}`;

  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileName,
      Body: uploadBuffer,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  const url = `${process.env.R2_PUBLIC_URL}/${fileName}`;

  // Legacy response shape used across admin/profile clients
  return NextResponse.json({
    url,
    meta: {
      originalSize: file.size,
      finalSize: uploadBuffer.byteLength,
      savedPercent: parseFloat(
        (
          ((file.size - uploadBuffer.byteLength) / Math.max(file.size, 1)) *
          100
        ).toFixed(1)
      ),
      optimized: optimize,
      format: ext,
    },
  });
}
