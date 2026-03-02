import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";

// tracker component is mounted inside <App> so it will run on every route change.
// previously we only bumped once per session which made the counter appear
// static. now we call the RPC on each path change and surface errors to
// console for debugging.
export const PageViewTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const track = async () => {
      try {
        const { error } = await (supabase.rpc as any)("increment_page_views");
        if (error) {
          console.warn("failed to increment page views", error.message);
        }
      } catch (e) {
        console.error("unexpected error incrementing page views", e);
      }
    };
    track();
  }, [location.pathname]);

  return null;
};
