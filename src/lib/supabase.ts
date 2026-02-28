import { supabase as baseClient } from "@/integrations/supabase/client";

// Thin wrapper để dùng alias thống nhất trong app
export const supabase = baseClient;

