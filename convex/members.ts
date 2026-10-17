import { v } from "convex/values";
import { query, mutation, internalQuery } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { getCurrentMember, requireMember, requireTier } from "./authz";

/** Strips fields that must never reach a client (password hash). */
function toPublic(member: Doc<"members">) {
  const { passwordHash: _passwordHash, ...rest } = member;
  return rest;
}

/** The signed-in caller's own member row, or null (not signed in / not linked yet). */
export const current = query({
  args: {},
  handler: async (ctx) => {
    const member = await getCurrentMember(ctx);
    return member ? toPublic(member) : null;
  },
});

/** Full directory — any active member can see it. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireMember(ctx);
    const members = await ctx.db.query("members").collect();
    return members.map(toPublic);
  },
});

/**
 * Called once per session after Google sign-in (see
 * src/components/providers/ensure-member-linked.tsx). Attaches the signed-in
 * Google account to a pre-existing member row that matches by email but has
 * no authSubject yet — the only way such a row exists is if someone (an
 * admin, or the invite-consume flow) created it ahead of time. Does NOT
 * create new rows for unrecognized accounts — that only happens through
 * inviteTokens consumption. See docs/PLAN.md.
 */
export const ensureLinked = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const byAuthSubject = await ctx.db
      .query("members")
      .withIndex("by_authSubject", (q) => q.eq("authSubject", identity.subject))
      .first();
    if (byAuthSubject) return byAuthSubject._id;

    const email = identity.email;
    if (email) {
      // Case-insensitive: Google doesn't guarantee returning an email in
      // the exact casing it was originally typed/stored, and emails are
      // conventionally case-insensitive. Stored emails are expected
      // lowercase (seeding/signup normalize to lowercase too).
      const byEmail = await ctx.db
        .query("members")
        .withIndex("by_email", (q) => q.eq("email", email.toLowerCase()))
        .first();
      if (byEmail && !byEmail.authSubject) {
        await ctx.db.patch(byEmail._id, { authSubject: identity.subject });
        return byEmail._id;
      }
    }

    return null;
  },
});

export const setTier = mutation({
  args: {
    memberId: v.id("members"),
    tier: v.union(
      v.literal("initiate"),
      v.literal("operator"),
      v.literal("coordinator"),
      v.literal("admin"),
    ),
  },
  handler: async (ctx, { memberId, tier }) => {
    await requireTier(ctx, "admin");
    await ctx.db.patch(memberId, { tier });
  },
});

export const setStatus = mutation({
  args: {
    memberId: v.id("members"),
    status: v.union(v.literal("active"), v.literal("suspended")),
  },
  handler: async (ctx, { memberId, status }) => {
    await requireTier(ctx, "coordinator");
    await ctx.db.patch(memberId, { status });
  },
});

/**
 * Internal only — includes passwordHash. Called from convex/auth.ts's
 * "use node" actions (verifyPassword, consumeInviteWithPassword), never
 * exposed as a public function.
 */
export const getByEmailForAuth = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }): Promise<Doc<"members"> | null> => {
    // Case-insensitive, same reasoning as ensureLinked above.
    return await ctx.db
      .query("members")
      .withIndex("by_email", (q) => q.eq("email", email.toLowerCase()))
      .first();
  },
});
