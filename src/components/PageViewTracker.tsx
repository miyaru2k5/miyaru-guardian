import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const SESSION_KEY = "page_view_counted";

export const PageViewTracker = () => {
  const location = useLocation();

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    sessionStorage.setItem(SESSION_KEY, "1");
    supabase.rpc("increment_page_views").catch(() => {});
  }, [location.pathname]);

  return null;
};
