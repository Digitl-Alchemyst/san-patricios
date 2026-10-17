# Launch Readiness

Honest status check, not a sales pitch. "Done" below means verified working against the real
Convex deployment (CLI calls, direct data inspection, or an actual HTTP round-trip) — not just
`pnpm build` passing. See `docs/PLAN.md` and `docs/ARCHITECTURE.md` for how each piece works.

## Done and verified

- Public site (`/`, `/mission`, `/operations`, `/connect`) — real content, no mock data, no
  anchor-scroll one-pager.
- Auth: Google OAuth + email/password via NextAuth, both wired to a working Convex-token bridge.
- Real membership enforcement — a NextAuth session alone doesn't grant `/app` access; checked
  against a live Convex `members` row in `src/app/app/layout.tsx`.
- Invite-only account creation: `/join` → `/app/join-requests` review → invite link →
  `/signup/[token]` → account created at the tier the coordinator chose.
- Tier system (`pending`/`initiate`/`operator`/`coordinator`/`admin`) enforced inside Convex
  functions (`convex/authz.ts`), not just hidden in the UI.
- Live group chat and operations (list/create/join/comment) via Convex `useQuery`/`useMutation` —
  the actual "always-live" requirement this backend was chosen for.
- Brute-force protection on login: per-email lockout (5 attempts/15 min → 15 min lockout) and
  per-IP rate limiting (20/10 min → 10 min lockout), verified by actually tripping the lockout via
  `npx convex run` and inspecting the stored state, not just reading the code.
- Admin account seeded (`Radical Edward`) and will self-activate via email match on first real
  sign-in.
- A real, repro'd Next.js 16 / Convex interaction bug (dev-only "Instant Navigation" validation
  crashing inside `ConvexProvider`) found and fixed — see `next.config.ts` and
  `docs/ARCHITECTURE.md`.
- A real infinite redirect loop (`ERR_TOO_MANY_REDIRECTS` on `/login` ↔ `/app/dashboard`) found
  and fixed — `proxy.ts` was bouncing any session away from `/login`, which raced against the
  client-side account-linking step for a first-time Google sign-in. Fixed by making `proxy.ts`
  one-directional and adding `src/app/auth/complete/page.tsx` to sequence linking correctly before
  entering `/app`. See `docs/ARCHITECTURE.md`.
- **The actual reason Google sign-in couldn't find the admin account, found and fixed**: the
  Convex-token bridge (`src/server/actions/convex-token.ts`) was signing an empty JWT payload —
  `identity.email` was `undefined` inside every Convex function the entire time, so
  `ensureLinked`'s by-email matching never had anything to match against, for any account, since
  this bridge was first written. Not something the email/password work broke. Fixed by actually
  including the email/name claims in the signed token. See `docs/ARCHITECTURE.md`.

## Blocking gaps — don't call this launched with these open

1. **Client-side encryption was never wired in.** This was the original, explicit ask — "encrypt
   everything on Convex so they can't see anything" — and it's still not connected. The crypto
   wrapper exists (`src/lib/crypto/network-key.ts`, AES-GCM via Web Crypto) but no read/write path
   calls it. **Chat messages, operation objectives/resources/comms, and join-request answers are
   plaintext in Convex right now.** Given how central OPSEC messaging is to this site's own
   content, this is the gap most worth closing before real members rely on it. Wiring it in means:
   renaming the relevant `convex/schema.ts` fields back to their `...Cipher` form, distributing a
   shared "network key" to members out-of-band during vetting, and routing every read/write
   through `encryptField`/`decryptField`. Scope and honest limits (Convex still sees who's talking
   to whom and when, even once this lands) are already written up in `docs/PLAN.md`.
2. **No real Google sign-in has been tested.** Everything verified this far was via `curl`/
   `npx convex run`, which can't complete an OAuth consent screen. Click "Sign in with Google"
   yourself before trusting it. If the Google Cloud OAuth app is still in "Testing" publishing
   status, only test users explicitly listed there can sign in at all — check that before inviting
   anyone real.
3. **Still pointed at a Convex dev deployment and `localhost`.** Nothing has been deployed
   anywhere. Going live needs: a Convex production deployment (`npx convex deploy`, separate from
   the current `dev:fortunate-llama-181`), a real hosting target for the Next.js app (Vercel or
   similar), a production Google OAuth redirect URI added alongside the localhost one, and all of
   `.env.local`'s values (`AUTH_SECRET`, `AUTH_GOOGLE_ID`/`SECRET`,
   `CONVEX_AUTH_PRIVATE_KEY_PKCS8_BASE64`/`CONVEX_AUTH_KID`, `NEXT_PUBLIC_CONVEX_URL`, etc.) set as
   real environment variables on whatever hosts it — none of this is deployed anywhere yet.

## Not blocking, but real gaps

- No in-app UI for promoting/suspending a member — only via `npx convex run` or the Convex
  dashboard (`members.setTier`/`setStatus` exist as callable mutations, see
  `docs/ACCOUNT_TIERS.md`).
- No password-reset flow for email/password accounts. Someone locked out of a credentials account
  currently has no self-service recovery path.
- No rate limiting on `/join` itself (only on login) — someone could script-spam the public intake
  form. Lower priority since it doesn't grant access to anything, just creates review-queue noise.
- No automated tests (unit or e2e) — all verification this far has been manual/CLI-based against
  the real dev deployment.
- No account-settings flow to add a second auth method to an existing account (e.g. a
  Google-created account later setting a password, or vice versa) — whichever method an account
  was created with is the only one that works for it.
- Mobile/responsive behavior hasn't been specifically tested beyond Tailwind's default responsive
  utilities already used throughout.
- "Rotate the shared network encryption key" is listed as an admin capability in
  `docs/ACCOUNT_TIERS.md`, but is moot until encryption (gap #1 above) actually exists to rotate.

## Suggested order of attack

1. Wire up the encryption layer (gap #1) — the one piece that changes what this site actually *is*
   from a trust standpoint, and the original ask that's been deferred twice now.
2. Test real Google sign-in end-to-end in a browser, including the admin account's auto-link.
3. Production deployment (Convex + hosting + env vars + OAuth redirect URI).
4. The "not blocking" list, roughly in the order above, as time allows.
