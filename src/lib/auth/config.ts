import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { fetchAction } from "convex/nextjs";
import { api } from "@convex/_generated/api";

/**
 * NextAuth.js (Auth.js v5) config — third-party SDK setup, hence living in
 * lib/ per the layered folder convention (see docs/ARCHITECTURE.md).
 *
 * Two providers: Google, and email+password (Credentials). JWT session
 * strategy — no database adapter, so nothing about the session itself is
 * stored with a third-party identity platform; `AUTH_SECRET`
 * signs/encrypts the session cookie locally.
 *
 * Having a NextAuth session only means "this is a verified identity"
 * (either a Google account, or an email+password pair matching a stored
 * hash). It does NOT by itself mean the person has member access — that's
 * decided by whether a Convex `members` row exists for their account
 * (created only through the invite-token signup flow — see
 * docs/PLAN.md). Anything gated only by `auth()` returning a session (e.g.
 * src/proxy.ts) is an optimistic check, not the final authorization check —
 * see src/app/app/layout.tsx for the real one.
 *
 * Password verification happens in Convex (convex/auth.ts, a "use node"
 * action — bcrypt needs the Node runtime), never in this file, so a
 * password hash never has a reason to transit through the Next.js server.
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      // Without this, Google silently signs in with whichever of the
      // browser's multiple logged-in accounts it considers "active" instead
      // of asking — easy to not notice you're suddenly on a different
      // account than the one that worked a moment ago. Forces the account
      // picker every time.
      authorization: { params: { prompt: "select_account" } },
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials, request) => {
        const email = typeof credentials?.email === "string" ? credentials.email : undefined;
        const password = typeof credentials?.password === "string" ? credentials.password : undefined;
        if (!email || !password) return null;

        // Best-effort client IP for convex/auth.ts's per-IP brute-force
        // limiter — x-forwarded-for's first entry is the original client
        // when behind a proxy; falls back to x-real-ip, then unset (the
        // limiter pools unset under "ip:unknown", which still protects
        // against a single source hammering many emails).
        const ip =
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          request.headers.get("x-real-ip") ??
          undefined;

        const result = await fetchAction(api.auth.verifyPassword, { email, password, ip });
        if (!result) return null;

        return { id: result.id, email: result.email, name: result.handle };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    // Route OAuth errors back through our own page instead of NextAuth's
    // built-in /api/auth/error, which 500s in this beta rather than
    // rendering — see docs/ARCHITECTURE.md's "Known OAuth error" note. This
    // also covers a real, reproduced oauth4webapi/Google interaction bug:
    // Google now sends an `iss` param on successful callbacks (RFC 9207)
    // but apparently not consistently on access_denied/error ones, and
    // oauth4webapi throws on the missing param either way — not something
    // fixable in our own code. /login reads ?error= and shows a plain
    // "try again" message regardless of which specific error code landed.
    error: "/login",
  },
  callbacks: {
    jwt({ token, user, account }) {
      // Real bug, found by diagnostic logging a changing "stable" subject
      // on every Google sign-in: without a database adapter (we use JWT
      // sessions, no adapter), NextAuth's `user.id` for an OAuth provider
      // is a FRESH RANDOM UUID generated on every single sign-in — not
      // Google's actual subject claim. That's documented behavior in
      // @auth/core (see the defaultProfile/defaultAccount comments in
      // node_modules/@auth/core's providers.ts), not a misconfiguration,
      // but easy to miss: the actually-stable value for an OAuth account is
      // `account.providerAccountId` (built from the profile's real `sub`),
      // only present alongside `account` on the initial sign-in callback.
      // Credentials provider doesn't go through that OAuth account-building
      // path at all — authorize()'s returned `id` (our own Convex member
      // _id, see convex/schema.ts's authSubject field comment) lands
      // directly on `user.id` and IS stable, so that path still uses it.
      if (account?.provider === "google" && account.providerAccountId) {
        token.sub = account.providerAccountId;
      } else if (user?.id) {
        token.sub = user.id;
      }
      return token;
    },
    session({ session, token }) {
      // Exposed so src/server/actions/convex-token.ts can use a stable
      // identifier as the Convex-facing JWT's `sub` claim.
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
