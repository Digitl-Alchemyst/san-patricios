import { v } from "convex/values";
import { query, mutation, internalQuery, internalMutation } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

// Public — someone visiting /signup/[token] isn't a member yet.
export const preview = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const invite = await ctx.db
      .query("inviteTokens")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();
    if (!invite || invite.used || invite.expiresAt < Date.now()) return null;
    return {
      presetHandle: invite.presetHandle,
      presetTier: invite.presetTier,
      presetEmail: invite.presetEmail,
    };
  },
});

/**
 * Needs a Google sign-in first (ctx.auth.getUserIdentity()) but not an
 * existing member row — this is how a member row gets created for a
 * brand-new account. See docs/PLAN.md Phase 2.
 */
export const consume = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Sign in with Google first.");

    const invite = await ctx.db
      .query("inviteTokens")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();
    if (!invite || invite.used || invite.expiresAt < Date.now()) {
      throw new Error("This invite link is invalid or has expired.");
    }

    const alreadyLinked = await ctx.db
      .query("members")
      .withIndex("by_authSubject", (q) => q.eq("authSubject", identity.subject))
      .first();
    if (alreadyLinked) return alreadyLinked._id;

    await ctx.db.patch(invite._id, { used: true });

    return await ctx.db.insert("members", {
      authSubject: identity.subject,
      email: identity.email?.toLowerCase(),
      handle: invite.presetHandle,
      tier: invite.presetTier,
      focusAreas: invite.presetFocusAreas,
      status: "active",
      invitedBy: invite.createdBy,
      createdAt: Date.now(),
    });
  },
});

// Internal only — called from convex/auth.ts's "use node"
// consumeInviteWithPassword action, which can't query the DB directly.
export const getValidForAuth = internalQuery({
  args: { token: v.string() },
  handler: async (ctx, { token }): Promise<Doc<"inviteTokens"> | null> => {
    const invite = await ctx.db
      .query("inviteTokens")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();
    if (!invite || invite.used || invite.expiresAt < Date.now()) return null;
    return invite;
  },
});

// Internal only — the password-signup counterpart to `consume`, called from
// convex/auth.ts after it has already hashed the password. Sets authSubject
// to the new member's own _id (see the field's comment in convex/schema.ts)
// so the regular authSubject-based auth check works unchanged.
export const createMemberWithPassword = internalMutation({
  args: {
    inviteId: v.id("inviteTokens"),
    email: v.string(),
    passwordHash: v.string(),
    presetHandle: v.string(),
    presetTier: v.union(
      v.literal("initiate"),
      v.literal("operator"),
      v.literal("coordinator"),
      v.literal("admin"),
    ),
    presetFocusAreas: v.array(
      v.union(
        v.literal("Mutual Aid"),
        v.literal("Community for Self Defense"),
        v.literal("Cultural Education"),
        v.literal("Anti-Racism & Solidarity"),
    v.literal("Decolonization"),
        v.literal("Direct Action Support"),
      ),
    ),
    createdBy: v.id("members"),
  },
  handler: async (ctx, args): Promise<Id<"members">> => {
    await ctx.db.patch(args.inviteId, { used: true });

    const memberId = await ctx.db.insert("members", {
      email: args.email,
      passwordHash: args.passwordHash,
      handle: args.presetHandle,
      tier: args.presetTier,
      focusAreas: args.presetFocusAreas,
      status: "active",
      invitedBy: args.createdBy,
      createdAt: Date.now(),
    });
    await ctx.db.patch(memberId, { authSubject: memberId });
    return memberId;
  },
});
