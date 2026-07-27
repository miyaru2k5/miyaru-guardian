"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const InitialLoader = () => {
  const pathname = usePathname();
  const path = pathname ?? "/";
  const isAdminPath = path.startsWith("/admin");

  const [phase, setPhase] = useState<"hidden" | "show" | "fade">("hidden");

  useEffect(() => {
    if (isAdminPath) return;

    let shown = false;
    try {
      shown = sessionStorage.getItem("miyaru-initial-loader") === "1";
    } catch {
      shown = false;
    }
    if (shown) return;

    const start = window.setTimeout(() => setPhase("show"), 0);
    const fadeTimer = window.setTimeout(() => setPhase("fade"), 160);
    const removeTimer = window.setTimeout(() => {
      setPhase("hidden");
      try {
        sessionStorage.setItem("miyaru-initial-loader", "1");
      } catch {
        // ignore
      }
    }, 420);

    return () => {
      window.clearTimeout(start);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(removeTimer);
    };
  }, [isAdminPath]);

  if (isAdminPath || phase === "hidden") return null;

  return (
    <div className={`initial-loader ${phase === "fade" ? "fade-out" : ""}`}>
      <div className="flex flex-col items-center gap-4">
        <Image
          src="/loading.gif"
          width={140}
          height={140}
          alt="Đang tải..."
          priority
        />
        <p className="text-sm text-muted-foreground">Đang tải...</p>
      </div>
    </div>
  );
};

export default InitialLoader;
