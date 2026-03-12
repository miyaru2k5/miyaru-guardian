"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

// Tracker component runs on each route change.
const PageViewTracker = () => {
  const pathname = usePathname();

  useEffect(() => {
    const track = async () => {
      try {
        const { error } = await (supabase.rpc as any)("increment_page_views");
        if (error) {
          console.warn("failed to increment page views", error.message);
        }
      } catch (error) {
        console.error("unexpected error incrementing page views", error);
      }
    };
    track();
  }, [pathname]);

  return null;
};

export default PageViewTracker;
