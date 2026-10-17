# Architecture

Next.js 16 (App Router), React 19, Tailwind v4, Convex (backend/realtime), NextAuth.js (Auth.js v5,
Google + email/password). See `AGENTS.md` for where the local, version-pinned Next.js docs live
(`node_modules/next/dist/docs/`) — this build deliberately follows those over training-data
assumptions. Key 16-specific things this codebase relies on:

- **Proxy, not Middleware.** `src/proxy.ts` (Middleware was renamed in 16). Gates everything under `/app`.
- **`params`/`searchParams` are async.** Any dynamic route reads them via `await params`. A Client
  Component page can use React's `use(params)` instead, but see the Cache Components note below —
  a dynamic-segment page using that pattern with no `instant = false` ancestor hits a hard build
  error; `src/app/signup/[token]/page.tsx` is a worked example of the fix (Server Component
  wrapper awaiting `params` normally, with its own `export const instant = false`, rendering a
  Client Component child for the live Convex/auth bits).
- **Cache Components is on** (`cacheComponents: true` in `next.config.ts`). Reading `cookies()`/
  the NextAuth session/live Convex state can't happen at the top of a layout/page without either
  `"use cache: private"` or a `<Suspense>` boundary — or opting the segment out with
  `export const instant = false`. `src/app/app/layout.tsx` and `src/app/signup/[token]/page.tsx`
  both do this; `instant` **cannot** be exported from a `"use client"` file, which is why both are
  Server Component wrappers around Client Component children rather than client pages themselves.
- **A Convex `"use node"` action file that calls `ctx.runQuery`/`ctx.runMutation` on functions in
  other files will hit TypeScript error TS7022/TS7023 ("implicitly has type 'any' ... referenced
  ... in its own initializer")** unless every hop in the chain has an explicit return type —
  `convex/_generated/api.d.ts` type-imports *every* convex module (including the action file
  itself) to build the `api`/`internal` namespaces, and that action file imports `internal` back
  from the same generated file, which is a genuine circular type reference TS can't infer through.
  `convex/auth.ts` (the password-auth actions) is a worked example: both the internal
  query/mutation functions it calls (`members.getByEmailForAuth`,
  `inviteTokens.getValidForAuth`/`createMemberWithPassword`) *and* the action handlers themselves
  need explicit `Promise<...>` return type annotations — a `returns` validator alone isn't enough
  to satisfy the TypeScript compiler (it's a separate, runtime-only check). When this breaks, the
  error cascades oddly: unrelated files across the app start reporting `Parameter 'x' implicitly
  has an 'any' type` because the poisoned circular type degrades the whole generated API surface.

## Route map

The public site is a set of real, separately-routed pages — no anchor-scroll one-pager, no
client-side view switching. The member area lives under `/app` as a real path prefix (not a route
group), which is also what `proxy.ts` matches against.

```
/                           Landing page (teasers linking to the pages below)
/mission                    Full mission statement, focus areas, pull-quote, allied groups
/operations                 Public campaigns the movement backs (unauthenticated)
/connect                    Social / contact channels, presence map
/login                      Sign-in (NextAuth): Google, or email/password
/join                       Request-to-join intake form — unauthenticated, writes to Convex
                             joinRequests; no account is created at this step
/signup/[token]             Single-use invite acceptance — validates a coordinator-issued token,
                             then Google sign-in OR setting an email/password creates the member record
/auth/complete               Google sign-in's callback target — awaits account-linking before
                             forwarding to /app/dashboard (see Auth below)

/app                        Gated by proxy.ts (NextAuth session) AND a real Convex membership
                             check in src/app/app/layout.tsx — see Auth below
  /app/dashboard            Live stats + recent activity
  /app/chat                 Redirects to the first channel
  /app/chat/[channelId]     Group chat for one channel — live via Convex
  /app/operations           Operation list (internal, member-run ops) — live via Convex
  /app/operations/new       Create operation
  /app/operations/[id]      Operation detail, join button, live comms thread
  /app/members              Member directory — live via Convex
  /app/join-requests        Coordinator/admin-only: review applicants, approve → invite link
```

Note the public `/operations` (campaigns the movement backs, no login needed) is deliberately
distinct from `/app/operations` (where members actually create and run operations).

## Auth: NextAuth (Google + email/password) + a Convex-token bridge + real membership checks

Three layers, each doing a different job:

1. **NextAuth.js (Auth.js v5)** (`src/lib/auth/config.ts`) — two providers, JWT session strategy,
   no database adapter ("local": nothing about the session itself lives with a third-party
   identity platform).
   - **Google** — a NextAuth session only proves "this is a verified Google account." See the
     callbacks for how `session.user.id` gets the stable Google `sub`. Configured with
     `authorization: { params: { prompt: "select_account" } } `— without it, Google silently
     signs in with whichever of the browser's logged-in accounts it considers "active" instead of
     showing the account picker, which is exactly as confusing to debug as it sounds: it looks
     identical to a real account-matching failure, except the account actually being used changed
     out from under you between attempts with no visible indication. Always force the picker.
   - **Credentials (email/password)** — `authorize()` calls `fetchAction(api.auth.verifyPassword, ...)`.
     Password hashing/verification happens entirely inside Convex
     (`convex/auth.ts`, a `"use node"` action — bcryptjs needs the Node runtime, which is why this
     can't be a plain query/mutation), so a password hash never has a reason to transit through
     the Next.js server. `verifyPassword` returns `{ id, email, handle }` on success (`id` is the
     Convex member's own `_id` — see the `authSubject` field comment in `convex/schema.ts` for why
     that's what becomes `token.sub`/`session.user.id` for a credentials-based account, instead of
     a Google `sub`). Setting a password happens at invite-acceptance time
     (`convex/auth.ts`'s `consumeInviteWithPassword`, called from
     `src/components/signup-token-view.tsx` as the alternative to "sign in with Google" — either
     method is offered on `/signup/[token]`), not through any later account-settings flow (none
     exists yet).

   **Brute-force protection** (`convex/loginAttempts.ts`, enforced inside `verifyPassword`): two
   independent fixed-window counters, keyed by email and by IP respectively, each with its own
   threshold/window/lockout duration — email: 5 attempts / 15 min → 15 min lockout; IP: 20
   attempts / 10 min → 10 min lockout (either tripping blocks the attempt; constants live at the
   top of `convex/auth.ts`). A locked-out attempt returns the same `null` `verifyPassword`
   normally returns for a wrong password — it never reveals *why* an attempt failed, consistent
   with NextAuth's own Credentials-provider behavior of collapsing `authorize()` failures into a
   generic error client-side. The login form (`src/components/login-form.tsx`) separately calls
   the public, read-only `loginAttempts.status({ email })` query after a failed attempt to show a
   specific "try again in N minutes" message — safe to expose because it only reports lockout
   state for that key, never whether an account with that email exists. IP is best-effort,
   extracted from `x-forwarded-for`/`x-real-ip` in `authorize()`'s `request` parameter; falls back
   to a shared `"ip:unknown"` bucket when absent, which still protects against a single source
   hammering many emails. `consumeInviteWithPassword` (invite acceptance) deliberately has no
   IP limiter — it's called directly from a Client Component with no real `Request` to pull an IP
   from, so every caller would share the `"unknown"` bucket and risk locking out unrelated
   visitors; the invite token itself (192 bits of entropy) is the actual protection there.
2. **The Convex-token bridge** (`src/server/actions/convex-token.ts` + `convex/auth.config.ts`) —
   NextAuth's session cookie is encrypted, not a signature Convex can verify, so this Server Action
   re-verifies the session server-side and mints a short-lived, separately-signed ES256 JWT (via
   `jose`) that Convex validates against the public key embedded in `convex/auth.config.ts` as a
   JWKS data URI. `src/hooks/use-convex-auth-from-next-auth.ts` is the `useAuth` hook
   `ConvexProviderWithAuth` (`src/components/providers/convex-client-provider.tsx`) calls to fetch
   that token. The matching ES256 private key lives in `.env.local`
   (`CONVEX_AUTH_PRIVATE_KEY_PKCS8_BASE64` / `CONVEX_AUTH_KID`) — gitignored, not in the repo.

   **The JWT payload has to carry whatever claims Convex-side code reads off `identity`** — `sub`
   is the only one the builder methods (`.setSubject()` etc.) set automatically. This bit:
   `mintConvexToken` originally signed an empty `{}` payload, so `identity.email` was always
   `undefined` inside Convex even though `session.user.email` was right there on the NextAuth side
   — `ensureLinked`'s by-email matching silently never ran, for *any* account, the entire time
   (not something the email/password work broke; it was broken from when this bridge was first
   written). Fixed by passing `{ email: session.user.email, name: session.user.name }` into
   `new SignJWT(...)`. If another Convex function ever needs another identity field, it has to be
   added here the same way — Convex's `UserIdentity` fields map 1:1 to JWT claim names (see
   `node_modules/convex/dist/esm-types/server/authentication.d.ts` for the full list of which
   field reads which claim).
3. **Real membership** — having a Convex-verifiable token still only proves Google identity, not
   access. `convex/authz.ts`'s `requireMember`/`requireTier` are what every Convex query/mutation
   actually calls to check an active, linked `members` row exists at the right tier.
   `src/app/app/layout.tsx` does the equivalent check server-side (`fetchQuery(api.members.current, ...)`
   with a server-minted token) before rendering anything under `/app`, and `proxy.ts`'s
   cookie-presence redirect is just the earlier, cheaper optimistic gate.

   **`proxy.ts` is deliberately one-directional** — it only ever redirects `/app/*` → `/login`
   when there's no session, never the reverse. An earlier version also bounced an
   authenticated-but-not-yet-a-member session away from `/login` straight to `/app/dashboard`,
   which produced a genuine infinite redirect loop (`ERR_TOO_MANY_REDIRECTS`): session exists →
   proxy sends you to `/app/dashboard` → the layout finds no linked `members` row yet → sends you
   back to `/login` → proxy sends you back to `/app/dashboard` → forever. Don't reintroduce that
   redirect without also solving the race below.

**How a member row gets created** (no public self-serve signup, ever):

- **Pre-seeded** (e.g. the initial admin account): inserted directly into Convex (via
  `npx convex import`, or the dashboard) with no `authSubject`, just an `email`. The first time
  that Google account signs in, `convex/members.ts`'s `ensureLinked` mutation matches it by email
  and attaches the real `authSubject`. Two call sites: `src/components/providers/ensure-member-linked.tsx`
  (mounted globally in the root layout, fire-and-forget, a general safety net on any page) and
  `src/app/auth/complete/page.tsx` (awaited, see below). **Google's OAuth callback redirects to
  `/auth/complete`, not straight to `/app/dashboard`** — `ensureLinked` is a client-side mutation,
  so it needs a page to actually mount and run before anything server-side checks membership. A
  pre-seeded account's first-ever Google sign-in would otherwise race: the OAuth callback redirects
  straight into `/app/dashboard`, whose server-side check runs before any client code (including
  `ensure-member-linked.tsx`'s effect) has had a chance to execute, finding no linked member yet —
  this was the proximate trigger for the redirect-loop bug above. `/auth/complete` awaits
  `ensureLinked()` before advancing to `/app/dashboard`, closing that race. It's harmless/idempotent
  for an already-linked returning member too. (Credentials-provider and invite-acceptance
  sign-ins don't need this detour — both set `authSubject` atomically in the same mutation that
  creates the session identity, so there's no window where it could be missing.) See
  `docs/ACCOUNT_TIERS.md`.
- **Invited**: `/join` → a coordinator reviews it at `/app/join-requests` → `approveAndInvite`
  mutation creates a single-use `inviteTokens` row → applicant visits `/signup/[token]` → Google
  sign-in → `convex/inviteTokens.ts`'s `consume` mutation creates the `members` row using the
  tier/handle/focus-areas the coordinator set at approval time.

A coordinator can't mint an `admin`-tier invite (`approveAndInvite` only allows `initiate`/
`operator`/`coordinator`) — granting admin requires an existing admin calling `members.setTier`
directly (Convex dashboard for now; no in-app UI for it yet). Tiers, in rank order: `pending` <
`initiate` < `operator` (can also create/manage operations) < `coordinator` < `admin` — see
`docs/ACCOUNT_TIERS.md`.

## Layered folder structure (`src/`)

Modeled on a separation-of-concerns pattern from another project in this workspace — "the same
type of thing handled the same way everywhere":

- `lib/` — **third-party SDK wrappers only**: `lib/convex` (the `ConvexReactClient` singleton),
  `lib/auth` (NextAuth config + its type augmentation), `lib/crypto` (the Web Crypto wrapper —
  written but not yet wired into any read/write path, see docs/PLAN.md). Nothing else goes here.
- `utils/` — pure, dependency-free helper functions.
- `services/<feature>/` — the client-side hook layer that composes Convex's `useQuery`/
  `useMutation` into typed, feature-named functions (`services/operations/use-operations.ts`,
  `services/chat/use-chat.ts`, `services/members/use-members.ts`). Pages/components call these,
  never `convex/react`'s hooks or `api.*` directly.
- `server/actions/` — Next.js Server Actions (`'use server'`) for things that aren't live
  Convex-hook reads/writes: just `convex-token.ts` (the auth bridge) today. Realtime/CRUD reads and
  writes (chat, operations, members, join requests, invites) go straight through `services/` +
  Convex's hooks from Client Components instead, since those need live subscriptions a Server
  Action can't give them — including the `/join` intake form and invite consumption, both plain
  `useMutation` calls despite being "form-like," because Convex mutations don't need a Server
  Action to be called safely (auth/authorization is enforced inside the Convex function itself via
  `convex/authz.ts`, not by how the client happened to invoke it).
- `models/types/<domain>/` — shared TypeScript types (`Operation`, `ChatMessage`, `Member`, …) for
  things that aren't 1:1 with a Convex table shape (Convex's own generated types from
  `convex/schema.ts`, via `@convex/_generated/dataModel`, are the source of truth for table rows).
- `models/validations/` — reserved for zod schemas; not populated yet (validation currently lives
  inline in the relevant Convex mutation/component).
- `content/` — static public-facing copy with no I/O (`social-links.ts`, `allied-groups.ts`,
  `presence-cities.ts`, `public-campaigns.ts`). This project has no CMS, so this folder is where
  that kind of content lives instead.
- `components/providers/` — cross-cutting React Context providers, composed in `src/app/layout.tsx`:
  `AuthSessionProvider` (NextAuth), `ConvexClientProvider` (Convex + the auth bridge),
  `EnsureMemberLinked` (fires the pre-seeded-account linking mutation once per session, renders
  nothing).

`@convex/*` is a `tsconfig.json` path alias to the repo-root `convex/` folder (Convex requires that
folder outside `src/` — a hard framework constraint, not a style choice), so generated-API imports
read `@convex/_generated/api` / `@convex/_generated/dataModel` instead of fragile relative paths.

## Data — Convex, no mock data remaining

`convex/schema.ts` is the source of truth. Tables: `members`, `operations`, `operationComms`,
`chatChannels`, `chatMessages`, `joinRequests`, `inviteTokens`. Functions live one file per table
at the repo-root `convex/` (`members.ts`, `operations.ts`, `chat.ts`, `joinRequests.ts`,
`inviteTokens.ts`), with shared authorization helpers in `convex/authz.ts`.

A few queries resolve IDs to display values server-side rather than making the client join data
itself — e.g. `chat.listMessages` returns each message with an `authorHandle` already attached,
`operations.get` returns `participantHandles` alongside the operation. This keeps components simple
and avoids extra round-trips.

**Not yet wired: client-side field encryption.** `convex/schema.ts`'s header comment explains the
current state — `objective`/`resources`/`body`/`statement`-type fields are plaintext in Convex
right now, even though `src/lib/crypto/network-key.ts` (AES-GCM via Web Crypto) exists for exactly
this purpose. Re-enabling it means renaming fields back to their `...Cipher` form and routing
reads/writes through `encryptField`/`decryptField` with a shared "network key" distributed
out-of-band during vetting. See docs/PLAN.md's non-goals section — this was a deliberate
sequencing choice (ship a correct, working realtime app first), not a silent drop.

## Theming

Dark-only. Tokens live in `src/app/globals.css` under `@theme`:

- `--color-void` / `--color-surface` / `--color-surface-2` — background layers
- `--color-border` — red-tinted hairline borders
- `--color-bone` / `--color-smoke` — text
- `--color-arm-red` / `--color-arm-red-dim` — primary accent, drawn from the logo/seal artwork
- `--color-arm-gold` — secondary accent (the glow outline color in the existing marks), used sparingly
