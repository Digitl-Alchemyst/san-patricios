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
  v.literal("Direct Action Support"),
  v.literal("Media & Awareness"),
  v.literal("Digital Security"),
  v.literal("Community Defense"),
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

  operationComms: defineTable({
    operationId: v.id("operations"),
    authorId: v.id("members"),
    body: v.string(),
    createdAt: v.number(),
  }).index("by_operation", ["operationId"]),

  chatChannels: defineTable({
    name: v.string(),
    topic: v.string(),
  }).index("by_name", ["name"]),

  chatMessages: defineTable({
    channelId: v.id("chatChannels"),
    authorId: v.id("members"),
    body: v.string(),
    createdAt: v.number(),
  }).index("by_channel", ["channelId"]),

  joinRequests: defineTable({
    handle: v.string(),
    contact: v.string(), // Signal/Session/PGP-capable email
    cityRegion: v.optional(v.string()),
    interestedFocusAreas: v.array(focusArea),
    experience: v.string(), // prior organizing/experience
    statement: v.string(), // why they want to join
    reference: v.optional(v.string()), // optional vouch/reference
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("denied")),
    reviewedBy: v.optional(v.id("members")),
    createdAt: v.number(),
  }).index("by_status", ["status"]),

  inviteTokens: defineTable({
    token: v.string(), // opaque random string, the /signup/[token] segment
    joinRequestId: v.optional(v.id("joinRequests")),
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
