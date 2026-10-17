# Resistance HQ — Project Plan

Private members' site for the Anonymous Resistance Movement (ARM): a public-facing
landing page plus a members-only area for internal coordination.

## Sources used

- Former site export: `D:\11. Anon Resistance\.006.Web Development\Sites\04. Export\Anon Resistance`
  (mission statement, nav structure, operation naming conventions, doxx-submission flow)
- Facebook page: https://www.facebook.com/AnonResistanceMovement (listed as DC-based; page
  itself returned no extra copy beyond the title)
- Artwork in `public/`: ARM Logo, seal/fist mark, banner, circle-A, Guy Fawkes "V" mark
- Past-operations archive: `D:\11. Anon Resistance\.002. Anon Resistance Operations` — used only
  to pick codenames/themes for the public `/operations` page (Op SafeWinter, Op Right2Rest,
  Op Flint, Op Black Snake / Op NoDAPL, Op Monsanto, Op Free Palestine, Op ISIS, Op PigRoast,
  Op BashTheFash / Op DomesticTerrorism, Op IWW Support, Op ExposeCPS). This archive also holds
  a lot that was **not** used: doxx files
  with individual names, conspiracy-theory material (Pizzagate, chemtrails, "lizards"), raw
  credential/member-list files. Only folder names were read to choose campaigns — file contents
  in that archive weren't opened or pulled into the site. If picking more campaigns from there
  later, same rule: name/theme only, vet before using, skip anything doxx- or
  conspiracy-flavored.
  - **Op Icarus was deliberately left out.** The real operation was a 2016 DDoS campaign against
    banks/exchanges — presenting it as a campaign to rally behind on a public recruitment page
    reads as endorsing attacks on financial infrastructure, so it's excluded.
  - **Op ISIS, Op PigRoast, and Op BashTheFash / Op DomesticTerrorism are reframed**, same
    pattern as elsewhere in this doc: described around their legitimate public-interest angle
    (countering extremist propaganda; police misconduct accountability reporting; monitoring and
    publicly documenting fascist/domestic-terror organizing) rather than the
    doxxing-or-violence-adjacent parts of the originals — the name "Bash the Fash" literally
    implies physical confrontation, which isn't what the copy describes or endorses.
- **Op ExposeCPS is listed with a warning, not dropped**: its Facebook account was later
  compromised by a hostile (pro-Trump) infiltrator and is no longer movement-controlled. The card
  on `/operations` shows a flagged warning (`PublicCampaign.warning` in
  `src/content/public-campaigns.ts`) instead of being removed. The public `/operations` page still
  doesn't link to any third-party social accounts — see `docs/ARCHITECTURE.md`.
- **Admin account seeded**: `Radical Edward` (`anonresistance.arm@gmail.com`), tier `admin`,
  profile pulled from https://untelevised.media/author/radical-edward/. Seeded directly into the
  Convex `members` table (no password stored anywhere — this app only does Google OAuth, and that
  Google account's password has no use in this system). Not yet linked to a real sign-in; gets
  attached automatically the first time that exact Google account signs in, via
  `convex/members.ts`'s `ensureLinked`.

## Brand

- **Palette** (dark-only): near-black void background, deep red primary, a gold/amber accent
  pulled from the glow outlines in the existing logo/seal artwork, warm off-white text.
  Defined as CSS variables in `src/app/globals.css` (`--color-arm-red`, `--color-arm-gold`, etc).
- **Marks**: `public/ARM Logo.png` (wordmark), `public/Anon Resist-Fist.png` (seal), `public/arm banner.png`.
  `Anon Resistance Seal 02.png` is a 20MB source file — not used directly on the web; `Anon Resist-Fist.png`
  is the same mark at a sane size.
- **Voice**: plain and declarative, not theatrical. Early drafts leaned on Anonymous-meme flourishes
  ("transmit", "we are legion") — dialed back; copy states what a thing does.

## Current state: real backend, functioning end to end

The public site is real, separately-routed pages (no anchor-scroll one-pager, no client-side view
switching):

1. `/` — short landing page linking out to the pages below, not a long scroll of everything.
2. `/mission` — full mission statement, focus areas, pull-quote, allied groups.
3. `/operations` — **public** page of campaigns the movement backs (mirrors the old site's
   `operations.html`). Distinct from the members-only operations tool below.
4. `/connect` — social/contact channels, the on-the-ground presence map.
5. `/login` — real sign-in via NextAuth: Google, or email/password.
6. `/join` — unauthenticated intake form, writes straight to Convex (`joinRequests`), no account
   created at this step.
7. `/signup/[token]` — single-use invite link a coordinator generates after approving a join
   request; accepting it (Google, or setting an email/password) actually creates the member's
   account.
8. Members-only area under `/app`, gated by `proxy.ts` (NextAuth session) **and** a real Convex
   membership check in `src/app/app/layout.tsx` (a NextAuth session alone isn't enough — see Auth
   in `docs/ARCHITECTURE.md`):
   - **Dashboard** — live stats and recent activity, Convex-backed.
   - **Group chat** — one real route per channel (`/app/chat/[channelId]`), live via Convex
     `useQuery`/`useMutation` — this is the actual "always-live" feature the whole backend choice
     was for.
   - **Operations** — list, create, detail, join, and a live comms thread, all Convex-backed.
   - **Members** — live directory.
   - **Join Requests** — coordinator/admin-only review queue; approving generates the invite link.

No mock data remains anywhere in the app — see `docs/ARCHITECTURE.md` for the full backend
breakdown (Convex schema, NextAuth, the Convex-token bridge, the invite flow).

## Explicit non-goals / known gaps (current state)

- **Client-side encryption is built but not wired in.** `src/lib/crypto/network-key.ts` exists
  (AES-GCM via Web Crypto) but no write path calls it yet — chat bodies, operation content, and
  join-request answers are plaintext in Convex right now. This was a deliberate sequencing choice
  (ship a correct, working realtime app first) flagged explicitly to the user, not a silent drop.
  Wiring it in is the next real piece of work; see the field-naming note in `convex/schema.ts`.
- No doxx-submission tooling. The old site had a dedicated doxx-hosting flow (submit targets'
  personal info for publication). That's a harassment/targeting vector, not organizing
  infrastructure, so it's deliberately left out. "Operations" here model legitimate
  activist-coordination shape (mutual aid, direct action support, media/awareness,
  digital security) instead.
- No in-app UI yet for changing a member's tier or suspending them (`members.setTier`/
  `setStatus` mutations exist and are callable, just no page wired to them — Convex dashboard
  hand-editing is the documented path for now, see `docs/ACCOUNT_TIERS.md`).
- No presence/online tracking for the member directory (no heartbeat system).
