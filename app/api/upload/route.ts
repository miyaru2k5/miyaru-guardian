// app/api/upload/route.ts

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "@/lib/r2";
import { NextResponse } from "next/server";
import sharp from "sharp";

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

// Các định dạng ảnh hỗ trợ nén
const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/tiff",
];

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  // optimize=true  → nén + chuyển WebP
  // optimize=false → giữ nguyên file gốc
  const optimize = formData.get("optimize") !== "false";

  if (!file) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Chỉ hỗ trợ file ảnh" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File quá lớn. Tối đa 10 MB" }, { status: 413 });
  }

  const originalBuffer = Buffer.from(await file.arrayBuffer());
  const baseName = file.name.replace(/\.[^.]+$/, "").replace(/\s+/g, "-");

  let uploadBuffer: Buffer;
  let contentType: string;
  let ext: string;

  if (optimize && SUPPORTED_IMAGE_TYPES.includes(file.type)) {
    // ── Mode nén: resize + chuyển WebP ──────────────────────────────────
    uploadBuffer = await sharp(originalBuffer)
      .resize(1920, 1080, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toBuffer();

    contentType = "image/webp";
    ext = "webp";
  } else {
    // ── Mode gốc: giữ nguyên file ────────────────────────────────────────
    uploadBuffer = originalBuffer;
    contentType = file.type;
    ext = file.name.split(".").pop() || "jpg";
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

  return NextResponse.json({
    url,
    meta: {
      originalSize: file.size,
      finalSize: uploadBuffer.byteLength,
      savedPercent: parseFloat(
        (((file.size - uploadBuffer.byteLength) / file.size) * 100).toFixed(1)
      ),
      optimized: optimize,
      format: ext,
    },
  });
}