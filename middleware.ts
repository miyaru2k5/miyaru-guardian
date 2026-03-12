import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "miyaru-session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected =
    pathname === "/profile" ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/");

  if (!isProtected) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  if (sessionCookie?.value !== "1") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/profile"],
};
