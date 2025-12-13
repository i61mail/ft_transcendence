import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  const path = req.nextUrl.pathname;

  const isLogin = path === "/";
  const isDashboard = path.startsWith("/dashboard");

  if (isLogin && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (isDashboard && !token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Ensure middleware runs on the root (login page) and dashboard routes
  matcher: ["/", "/dashboard/:path*"],
};

