import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const adminToken = req.cookies.get("token")?.value;
  const guestToken = req.cookies.get("guest_token")?.value;
  const role = req.cookies.get("role")?.value; // "admin" | "super-admin"

  const isLoggedIn = !!adminToken;
  const isGuest = !!guestToken;
  const isSuperAdmin = isLoggedIn && role === "super-admin";
  const isAdmin = isLoggedIn && role === "admin";

  // ── Logged-in users hitting auth or invite pages ───────────────────
  if (isLoggedIn && (pathname === "/" || pathname === "/admin/login")) {
    return NextResponse.redirect(
      new URL(
        isSuperAdmin ? "/super-admin/dashboard" : "/admin/dashboard/chats",
        req.url,
      ),
    );
  }

  // ── Guest hitting invite or admin pages ────────────────────────────
  if (isGuest && !isLoggedIn) {
    if (
      pathname === "/" ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/super-admin")
    ) {
      return NextResponse.redirect(new URL("/chats", req.url));
    }
  }

  // ── Protect admin dashboard — admins only (not super-admin) ───────
  if (pathname.startsWith("/admin/dashboard") && !isLoggedIn) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  // ── Protect super-admin dashboard ─────────────────────────────────
  if (pathname.startsWith("/super-admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    if (!isSuperAdmin) {
      // Regular admin trying to access super-admin — kick to their dashboard
      return NextResponse.redirect(new URL("/admin/dashboard/chats", req.url));
    }
  }

  // ── Protect guest chat routes ──────────────────────────────────────
  if (pathname.startsWith("/chats") && !isGuest && !isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/admin/login",
    "/admin/dashboard/:path*",
    "/super-admin/:path*",
    "/chats/:path*",
  ],
};
