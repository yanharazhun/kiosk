import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session-cookie";

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/staff/login") return NextResponse.next();
  if (request.cookies.has(SESSION_COOKIE)) return NextResponse.next();
  return NextResponse.redirect(new URL("/staff/login", request.url));
}

export const config = {
  matcher: ["/staff", "/staff/:path*"],
};
