"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import MainLayout from "@/layouts/MainLayout";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const NotFoundContent = () => {
  const pathname = usePathname();

  useEffect(() => {
    console.error("404 Error: user accessed missing route:", pathname);
  }, [pathname]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">
          Xin lỗi! Không tìm thấy trang bạn yêu cầu.
        </p>
        <Button asChild variant="outline">
          <Link href="/">Về trang chủ</Link>
        </Button>
      </div>
    </div>
  );
};

const NotFoundPage = () => (
  <MainLayout>
    <NotFoundContent />
  </MainLayout>
);

export default NotFoundPage;
