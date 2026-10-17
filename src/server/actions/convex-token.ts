"use server";

import { SignJWT, importPKCS8 } from "jose";
import { auth } from "@/lib/auth/config";

// Must match convex/auth.config.ts's issuer/applicationID exactly (iss/aud claims).
const ISSUER = "https://sanpatricios.local/convex-auth";
const AUDIENCE = "san-patricios";
const TOKEN_TTL_SECONDS = 60 * 15;

/**
 * Mints a short-lived, Convex-verifiable ES256 JWT for the current, already
 * NextAuth-verified session. This is the bridge described in
 * convex/auth.config.ts and docs/ARCHITECTURE.md — called by
 * src/hooks/use-convex-auth-from-next-auth.ts's `fetchAccessToken`.
 *
 * Returns null when there's no session (Convex then treats the client as
 * unauthenticated — fine for public queries, rejected for ones that require
 * identity).
 */
export async function mintConvexToken(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const privateKeyBase64 = process.env.CONVEX_AUTH_PRIVATE_KEY_PKCS8_BASE64;
  const kid = process.env.CONVEX_AUTH_KID;
  if (!privateKeyBase64 || !kid) {
    throw new Error(
      "CONVEX_AUTH_PRIVATE_KEY_PKCS8_BASE64 / CONVEX_AUTH_KID are not set — see .env.local.",
    );
  }

  const pkcs8Pem = Buffer.from(privateKeyBase64, "base64").toString("utf8");
  const privateKey = await importPKCS8(pkcs8Pem, "ES256");

  // Convex's identity.email (used by convex/members.ts's ensureLinked to
  // match a pre-seeded account) reads directly from this JWT's `email`
  // claim — it has to actually be in the payload, not just on the NextAuth
  // session object.
  return new SignJWT({ email: session.user.email ?? undefined, name: session.user.name ?? undefined })
    .setProtectedHeader({ alg: "ES256", kid })
    .setSubject(session.user.id)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_TTL_SECONDS}s`)
    .sign(privateKey);
}
