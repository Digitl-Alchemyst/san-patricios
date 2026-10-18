# Account Tiers

Reference for how member access levels work. The real flow now exists (see `docs/PLAN.md` /
`docs/ARCHITECTURE.md`): intake (either `/join`, the full public application, or `/apply`, the
short unlisted one — see "Two application paths" below) → a coordinator reviews it at
`/app/join-requests` and picks the tier right there (`approveAndInvite`, `convex/joinRequests.ts`)
→ a single-use invite link → applicant visits `/signup/[token]` and sets a one-time password (or
skips that and signs in with Google instead) → either path creates the `members` row already at
the tier the coordinator chose. There's no separate "approve a pending row" step after that — the
tier is set at approval time, before the link is even sent.

## Two application paths

- `/join` — the full public application (`src/components/join-form.tsx` → `joinRequests.submit`,
  tagged `source: "join"`): heritage connection, experience, availability, statement, all the
  long-form fields. Linked from `PublicNav` and the homepage.
- `/apply` — a short form (`src/components/direct-apply-form.tsx` →
  `joinRequests.submitDirect`, tagged `source: "direct"`): just handle, login email, an optional
  contact, and an optional "who told you about us." **Deliberately unlisted** — not linked from
  `PublicNav`, the footer, or any other page. A member shares this URL directly with someone
  they've already vetted in person, as a shortcut past the long public form. Both paths land in
  the same `/app/join-requests` review queue (the "Direct / unlisted" badge marks which is which)
  and go through the same `approveAndInvite` → invite-link flow from there.

There is no Clerk in this stack — see `docs/PLAN.md` for why (NextAuth/Google only, kept "local").
Where a Clerk-based plan would say "edit the user's public metadata in the Clerk dashboard," the
equivalent here is `convex/members.ts`'s `setTier` mutation, exposed in-app on `/app/members`
(`MemberRankControls`, admin-only) — or hand-editing the row in the **Convex dashboard** (Data tab →
`members` table).

## Tiers

Rank order (`convex/authz.ts`'s `TIER_RANK`, mirrored client-side only for UI show/hide in
`src/models/types/member.ts` — the client copy is never the security boundary, Convex always
re-checks): `pending` < `initiate` < `operator` < `coordinator` < `admin`.

| Tier | Can do |
|---|---|
| `pending` | Not produced by any current flow — reserved for a manually-created placeholder row with no access decided yet. `requireMember` in `convex/authz.ts` treats it the same as "not a member." |
| `initiate` | Base tier (formerly called "member"). Dashboard, chat (read/write all channels), view and join operations, post operation comms, member directory. |
| `operator` | Everything `initiate` can, plus: create operations and change their status (`operations.create`/`operations.setStatus` in `convex/operations.ts`, both gated with `requireTier(ctx, "operator")`). |
| `coordinator` | Everything `operator` can, plus: review and approve/deny `joinRequests` (choosing `initiate`, `operator`, or `coordinator` tier at approval time), generate invite tokens, suspend members (`setStatus`). Can **not** promote anyone to `admin`. |
| `admin` | Everything `coordinator` can, plus: `members.setTier` to grant/revoke `admin` itself, full member management. |

## The `members` record

```ts
{
  _id: Id<"members">,
  authSubject?: string,          // stable Google account id — set on first real sign-in
                                  // (ensureLinked for a pre-seeded row, or consume for an invite)
  email?: string,                // used to match a pre-seeded row to its first Google sign-in
  handle: string,
  roleTitle?: string,             // descriptive only, e.g. "Field Organizer" — admin-set
                                  // (setRoleTitle), never checked by any authz logic
  bio?: string,
  avatarUrl?: string,
  socialLinks?: { label: string; url: string }[],
  tier: "pending" | "initiate" | "operator" | "coordinator" | "admin",
  focusAreas: FocusArea[],
  status: "active" | "suspended",
  invitedBy?: Id<"members">,
  createdAt: number,
}
```

**Pre-seeding an account ahead of time** (e.g. the initial admin): insert a `members` row with no
`authSubject`, just `email` + `handle` + the tier you want, `status: "active"`. The first time that
Google account signs in anywhere on the site, `ensureLinked` (fired once per session by
`src/components/providers/ensure-member-linked.tsx`) finds it by email and attaches the real
`authSubject` automatically — no manual step needed after that. `Radical Edward`
(`anonresistance.arm@gmail.com`, tier `admin`) was seeded this way via `npx convex import`.

**Changing an existing member's tier or status**: `members.setTier` (admin only, in-app at
`/app/members`) / `members.setStatus` (coordinator+, no UI yet — via `npx convex run` or the Convex
dashboard). Don't delete a row outright to revoke access — set `status` to `"suspended"` instead,
since `operationComms`/`chatMessages`/operation `participants` reference it by `_id`.

## Why no public tier list / self-serve role selection

Tiers are assigned entirely by hand by an existing coordinator/admin, never chosen by the member
themselves at signup — consistent with "vetting is manual" already stated on `/join`.

## Chat moderation and per-channel access

`chatChannels.minTier` (`convex/schema.ts`) sets a tier floor to view/post in that channel; unset
means open to any active member. Enforced server-side in `convex/chat.ts` (`requireChannelAccess`,
used by `listMessages` and `sendMessage`, and by `listChannels`' filter) — not just hidden in the
UI. Admins change it from the settings bar at the top of `/app/chat/[channelId]`
(`ChannelSettings`, `chat.updateChannelSettings`).

Per-message moderation is admin-only: `chat.deleteMessage` removes a message outright, and
`chat.timeoutMember`/`removeTimeout` manage a `chatTimeouts` row (one per channel+member) that
`sendMessage` checks before accepting a post. Both are exposed inline on hover over a message in
`ChatThread`; active timeouts for a channel also list in `ChannelSettings` with a way to lift one
early.
