import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import type { Database } from "@/types/supabase";

type AuthSuccess = {
  ok: true;
  user: User;
  isAdmin: boolean;
  status: 200;
};

type AuthFailure = {
  ok: false;
  status: 401 | 403;
  error: string;
};

function createRouteSupabase(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase env missing");
  }

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll() {
        // Route handlers typically do not need to refresh cookies mid-request.
      },
    },
    global: {
      headers: {
        Authorization: request.headers.get("Authorization") ?? "",
      },
    },
  });
}

export async function requireUser(
  request: NextRequest
): Promise<AuthSuccess | AuthFailure> {
  const supabase = createRouteSupabase(request);

  const authHeader = request.headers.get("Authorization");
  let user: User | null = null;

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const { data, error } = await supabase.auth.getUser(token);
    if (!error) user = data.user;
  } else {
    const { data, error } = await supabase.auth.getUser();
    if (!error) user = data.user;
  }

  if (!user) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  const { data: isAdmin } = await supabase.rpc("is_admin");

  return {
    ok: true,
    user,
    isAdmin: !!isAdmin,
    status: 200,
  };
}

export async function requireAdmin(
  request: NextRequest
): Promise<AuthSuccess | AuthFailure> {
  const result = await requireUser(request);
  if (!result.ok) return result;

  if (!result.isAdmin) {
    return { ok: false, status: 403, error: "Forbidden" };
  }

  return result;
}
