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
    supabase
      .rpc("increment_page_views")
      .then(({ error }) => {
        if (error) {
          // log but don't interrupt the user experience
          console.warn("failed to increment page views", error.message);
        }
      })
      .catch(e => {
        console.error("unexpected error incrementing page views", e);
      });
  }, [location.pathname]);

  return null;
};
