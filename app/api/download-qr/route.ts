import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return new Response("Missing url", { status: 400 });
  }

  try {
    const res = await fetch(url);

    if (!res.ok) {
      return new Response("Failed to fetch QR", { status: 500 });
    }

    const blob = await res.arrayBuffer();

    return new Response(blob, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": 'attachment; filename="vietqr.png"',
      },
    });
  } catch (err) {
    return new Response("Error downloading QR", { status: 500 });
  }
}