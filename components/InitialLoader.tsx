"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const InitialLoader = () => {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  const path = pathname ?? "/";
  const isAdminPath = path.startsWith("/admin");

  useEffect(() => {
    if (isAdminPath) {
      setVisible(false);
      return;
    }
    if (hasShown) return;

    setVisible(true);
    setFadeOut(false);

    const fadeTimer = window.setTimeout(() => setFadeOut(true), 160);
    const removeTimer = window.setTimeout(() => {
      setVisible(false);
      setHasShown(true);
    }, 420);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(removeTimer);
    };
  }, [isAdminPath, hasShown]);

  if (!visible) return null;

  return (
    <div className={`initial-loader ${fadeOut ? "fade-out" : ""}`}>
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
