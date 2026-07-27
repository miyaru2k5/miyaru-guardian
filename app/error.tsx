"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-2xl font-bold">Đã xảy ra lỗi</h1>
        <p className="text-sm text-muted-foreground">
          Hệ thống gặp sự cố tạm thời. Vui lòng thử lại.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Button onClick={reset} variant="outline" className="gap-2">
            <RefreshCw size={15} /> Thử lại
          </Button>
          <Button asChild className="gap-2">
            <Link href="/">
              <Home size={15} /> Về trang chủ
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
