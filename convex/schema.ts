import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Convex requires this file at the repo root (not under src/) — see
 * docs/ARCHITECTURE.md.
 *
 * NOTE on encryption: docs/PLAN.md describes encrypting sensitive content
 * client-side (src/lib/crypto/network-key.ts) before it reaches Convex.
 * That wiring is NOT connected yet — these fields hold plaintext for now so
 * the app has a working, correct baseline first. Re-enabling it is a
 * deliberate follow-up: rename `objective`→`objectiveCipher`,
 * `resources`→`resourcesCipher`, `body`→`bodyCipher`, etc., and route
 * reads/writes through encryptField/decryptField. Don't treat the current
 * plaintext fields as "already secure" in the sense docs/PLAN.md describes.
 */

const focusArea = v.union(
  v.literal("Mutual Aid"),
  v.literal("Community for Self Defense"),
  v.literal("Cultural Education"),
  v.literal("Anti-Racism & Solidarity"),
    v.literal("Decolonization"),
  v.literal("Direct Action Support"),
);

// The tiers assignable by an admin / settable as a channel's access floor —
// excludes "pending", which isn't produced by any current flow.
const assignableTier = v.union(
  v.literal("initiate"),
  v.literal("operator"),
  v.literal("coordinator"),
  v.literal("admin"),
);

export default defineSchema({
  members: defineTable({
    // A stable identity key — NOT necessarily a Google subject despite the
    // name (kept for continuity with the field's original purpose). For a
    // Google-authenticated account this is the Google `sub` claim, attached
    // on first sign-in (members.ensureLinked / inviteTokens.consume). For a
    // password-authenticated account it's set to the member's own _id at
    // creation time (convex/auth.ts's consumeInviteWithPassword) so the same
    // authSubject-lookup auth check works for either method. Optional until
    // that first link happens (e.g. a pre-seeded admin row). See docs/PLAN.md.
    authSubject: v.optional(v.string()),
    email: v.optional(v.string()),
    // Only set for password-authenticated accounts; never returned by any
    // public query — see convex/auth.ts.
    passwordHash: v.optional(v.string()),
    handle: v.string(),
    // Stable, slug-style identifier (lowercase/underscore) distinct from
    // `handle`'s display form — not used for lookups anywhere yet, just
    // carried alongside it. Optional since it predates this field.
    username: v.optional(v.string()),
    // Free-text title an admin can set, distinct from `tier` (which gates
    // permissions) — e.g. "Minister of Information", "Field Organizer".
    // Purely descriptive, never checked by any authz logic.
    roleTitle: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    socialLinks: v.optional(v.array(v.object({ label: v.string(), url: v.string() }))),
    tier: v.union(
      v.literal("pending"),
      v.literal("initiate"),
      v.literal("operator"),
      v.literal("coordinator"),
      v.literal("admin"),
    ),
    focusAreas: v.array(focusArea),
    status: v.union(v.literal("active"), v.literal("suspended")),
    invitedBy: v.optional(v.id("members")),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_authSubject", ["authSubject"])
    .index("by_handle", ["handle"]),

  operations: defineTable({
    codename: v.string(),
    objective: v.string(),
    focusArea,
    status: v.union(v.literal("Planning"), v.literal("Active"), v.literal("Completed"), v.literal("Archived")),
    targetDate: v.string(), // ISO date
    resources: v.array(v.string()),
    participants: v.array(v.id("members")),
    createdAt: v.number(),
  }).index("by_status", ["status"]),

  events: defineTable({
    title: v.string(),
    type: v.union(
      v.literal("Training"),
      v.literal("Mutual Aid"),
      v.literal("Direct Action"),
      v.literal("Patrol"),
      v.literal("Other"),
    ),
    description: v.string(),
    location: v.optional(v.string()), // member-only visibility, same as everything under /app
    startTime: v.number(), // unix ms
    endTime: v.optional(v.number()),
    status: v.union(v.literal("scheduled"), v.literal("cancelled"), v.literal("completed")),
    createdBy: v.id("members"),
    rsvps: v.array(v.id("members")),
    createdAt: v.number(),
  })
    .index("by_startTime", ["startTime"])
    .index("by_status", ["status"]),

  operationComms: defineTable({
    operationId: v.id("operations"),
    authorId: v.id("members"),
    body: v.string(),
    createdAt: v.number(),
  }).index("by_operation", ["operationId"]),

  chatChannels: defineTable({
    name: v.string(),
    topic: v.string(),
    // Minimum tier required to view/post in this channel. Unset = open to
    // any active member (the long-standing default behavior).
    minTier: v.optional(assignableTier),
  }).index("by_name", ["name"]),

  chatMessages: defineTable({
    channelId: v.id("chatChannels"),
    authorId: v.id("members"),
    body: v.string(),
    createdAt: v.number(),
  }).index("by_channel", ["channelId"]),

  // At most one row per (channelId, memberId) — see convex/chat.ts's
  // timeoutMember, which upserts rather than appending duplicates.
  chatTimeouts: defineTable({
    channelId: v.id("chatChannels"),
    memberId: v.id("members"),
    expiresAt: v.number(),
    createdBy: v.id("members"),
    createdAt: v.number(),
  })
    .index("by_channel_member", ["channelId", "memberId"])
    .index("by_channel", ["channelId"]),

  joinRequests: defineTable({
    // "join" (default, unset = legacy "join") is the full public /join
    // application; "direct" is the short, unlisted /apply form for people
    // already vetted in person by a member. Each path's own mutation
    // (convex/joinRequests.ts's `submit` vs `submitDirect`) enforces its
    // own required fields via its args validator — the table schema below
    // is loosened to the union of what either path can supply.
    source: v.optional(v.union(v.literal("join"), v.literal("direct"))),
    handle: v.string(),
    contact: v.optional(v.string()), // Signal/Session/PGP-capable email — required on the "join" path
    loginEmail: v.string(), // the email they'll use to log in — Gmail preferred, since sign-in supports Google
    cityRegion: v.optional(v.string()),
    heritageConnection: v.optional(v.string()), // Irish/Mexican/Indigenous/ally — self-described
    interestedFocusAreas: v.array(focusArea),
    experience: v.optional(v.string()), // prior organizing/experience
    availability: v.optional(v.string()), // time/days they can commit
    statement: v.optional(v.string()), // why they want to join — required on the "join" path
    reference: v.optional(v.string()), // optional vouch/reference; doubles as "who told you about us" on "direct"
    agreeToCodeOfConduct: v.boolean(), // required acknowledgment at application time
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("denied")),
    reviewedBy: v.optional(v.id("members")),
    createdAt: v.number(),
  }).index("by_status", ["status"]),

  inviteTokens: defineTable({
    token: v.string(), // opaque random string, the /signup/[token] segment
    joinRequestId: v.optional(v.id("joinRequests")),
    presetEmail: v.optional(v.string()), // carried from joinRequests.loginEmail, shown at /signup/[token]
    presetTier: v.union(
      v.literal("initiate"),
      v.literal("operator"),
      v.literal("coordinator"),
      v.literal("admin"),
    ),
    presetFocusAreas: v.array(focusArea),
    presetHandle: v.string(),
    createdBy: v.id("members"),
    used: v.boolean(),
    expiresAt: v.number(),
    createdAt: v.number(),
  }).index("by_token", ["token"]),

  // Rate limiting / lockout for the Credentials (email/password) login
  // path — see convex/loginAttempts.ts and the "Brute-force protection"
  // section of docs/ARCHITECTURE.md. `key` is either "email:<lowercased>"
  // or "ip:<address>"; tracked separately per key.
  loginAttempts: defineTable({
    key: v.string(),
    count: v.number(),
    windowStart: v.number(),
    lockedUntil: v.optional(v.number()),
  }).index("by_key", ["key"]),
});
