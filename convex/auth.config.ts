/**
 * Convex's Custom JWT auth provider. We're not using Clerk or a real OIDC
 * issuer — NextAuth's own session token is an encrypted cookie, not a
 * verifiable signed JWT, so it can't be handed to Convex directly. Instead,
 * src/server/actions/convex-token.ts mints a short-lived ES256 JWT (after
 * verifying the NextAuth session server-side) using the private half of the
 * keypair below; this file embeds the matching PUBLIC key as a JWKS data
 * URI so Convex can verify those tokens without needing a live
 * /.well-known endpoint. See docs/ARCHITECTURE.md.
 *
 * `issuer`/`applicationID` are just stable identifier strings here (not
 * fetchable URLs) — they only need to match the `iss`/`aud` claims on the
 * tokens we mint. They're the same across dev/prod (not secrets). `jwks`
 * IS per-deployment — read from a Convex deployment env var
 * (`npx convex env set CONVEX_AUTH_JWKS ...`, set separately for dev and
 * prod) rather than hardcoded, so dev and prod trust different keypairs.
 * See docs/ARCHITECTURE.md.
 */
const jwks = process.env.CONVEX_AUTH_JWKS;
if (!jwks) {
  throw new Error("CONVEX_AUTH_JWKS is not set for this deployment — see docs/ARCHITECTURE.md.");
}

export default {
  providers: [
    {
      type: "customJwt",
      issuer: "https://sanpatricios.local/convex-auth",
      applicationID: "san-patricios",
      algorithm: "ES256",
      jwks,
    },
  ],
};
