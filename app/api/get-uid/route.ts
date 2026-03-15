import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({
        status: "error",
        msg: "Thiếu URL facebook",
      });
    }

    const res = await fetch("https://likenhanh.pro/api/get_uid", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    const data = await res.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({
      status: "error",
      msg: "Không thể lấy UID",
    });
  }
}