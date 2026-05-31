import { NextResponse } from "next/server";
import { getServiceList } from "@/lib/tang-tuong-tac";

export async function GET() {
    try {
        const result = await getServiceList();
        return NextResponse.json(result);
    } catch (err: any) {
        return NextResponse.json(
            { status: "error", message: err.message || "Lỗi không xác định" },
            { status: 500 }
        );
    }
}