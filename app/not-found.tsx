"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import MainLayout from "@/layouts/MainLayout";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFoundContent = () => {
  const pathname = usePathname();

  useEffect(() => {
    console.error("404 Error: user accessed missing route:", pathname);
  }, [pathname]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 mt-10 sm:mt-16 pb-12">
      <div className="flex flex-col items-center text-center w-full max-w-2xl gap-8">

        {/* GIF — responsive sizes */}
        <img
          src="/404.gif"
          alt="404 not found"
          className="w-[72vw] sm:w-[60vw] md:w-[420px] lg:w-[480px] h-auto object-contain"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />


        {/* Buttons */}
        <div className="flex gap-3 flex-wrap justify-center">
          <Button asChild variant="outline" className="gap-2">
            <Link href="javascript:history.back()">
              <ArrowLeft size={15} /> Quay lại
            </Link>
          </Button>
          <Button asChild className="btn-glow gap-2">
            <Link href="/">
              <Home size={15} /> Về trang chủ
            </Link>
          </Button>
        </div>

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