import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";

// Next.js 16 renamed Middleware to Proxy; same mechanism. NextAuth's `auth`
// export doubles as a wrapped proxy/middleware function — `req.auth` is the
// session when there is one.
//
// This only checks "is there a verified session," not "is this person an
// approved member" (that's a Convex `members` row — see
// src/app/app/layout.tsx for the real check, and docs/PLAN.md). Deliberately
// one-directional: it blocks /app/* without a session, but does NOT bounce
// an authenticated-but-not-yet-a-member session away from /login. Doing
// that used to cause an infinite redirect loop — session exists → proxy
// sends you to /app/dashboard → layout.tsx finds no linked member yet →
// sends you back to /login → proxy sends you to /app/dashboard → forever.
// See docs/ARCHITECTURE.md and src/app/auth/complete/page.tsx (which
// handles the "just signed in, not linked yet" case properly instead).
export default auth((req) => {
  const hasSession = !!req.auth;
  const { pathname } = req.nextUrl;

  const isSecure = pathname.startsWith("/app");

  if (isSecure && !hasSession) {
    const url = new URL("/login", req.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/app/:path*", "/login", "/join"],
};
