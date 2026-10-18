import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireTier } from "./authz";

const focusArea = v.union(
  v.literal("Mutual Aid"),
  v.literal("Community for Self Defense"),
  v.literal("Cultural Education"),
  v.literal("Anti-Racism & Solidarity"),
    v.literal("Decolonization"),
  v.literal("Direct Action Support"),
);

function randomToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

// Public — no auth required, this is the unauthenticated /join intake form.
export const submit = mutation({
  args: {
    handle: v.string(),
    contact: v.string(),
    loginEmail: v.string(),
    cityRegion: v.optional(v.string()),
    heritageConnection: v.optional(v.string()),
    interestedFocusAreas: v.array(focusArea),
    experience: v.string(),
    availability: v.optional(v.string()),
    statement: v.string(),
    reference: v.optional(v.string()),
    agreeToCodeOfConduct: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (!args.handle.trim() || !args.contact.trim() || !args.statement.trim()) {
      throw new Error("Handle, contact, and statement are required.");
    }
    if (!args.loginEmail.trim() || !args.loginEmail.includes("@")) {
      throw new Error("A valid login email is required.");
    }
    if (!args.agreeToCodeOfConduct) {
      throw new Error("You must agree to the code of conduct to apply.");
    }
    await ctx.db.insert("joinRequests", {
      ...args,
      source: "join",
      loginEmail: args.loginEmail.trim().toLowerCase(),
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

/**
 * Public — no auth required. The short, unlisted /apply form: for people
 * already vetted in person by a member, who shares this URL directly
 * (never linked from nav/footer). Skips the long public-facing fields
 * (city/region, heritage connection, experience, availability, statement)
 * that /join's `submit` collects — same approval queue and invite flow
 * after that (convex/joinRequests.ts's `list`/`approveAndInvite`).
 */
export const submitDirect = mutation({
  args: {
    handle: v.string(),
    loginEmail: v.string(),
    contact: v.optional(v.string()),
    interestedFocusAreas: v.array(focusArea),
    reference: v.optional(v.string()), // "who told you about us?"
    agreeToCodeOfConduct: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (!args.handle.trim()) {
      throw new Error("Handle is required.");
    }
    if (!args.loginEmail.trim() || !args.loginEmail.includes("@")) {
      throw new Error("A valid login email is required.");
    }
    if (!args.agreeToCodeOfConduct) {
      throw new Error("You must agree to the code of conduct to apply.");
    }
    await ctx.db.insert("joinRequests", {
      handle: args.handle.trim(),
      loginEmail: args.loginEmail.trim().toLowerCase(),
      contact: args.contact?.trim() || undefined,
      interestedFocusAreas: args.interestedFocusAreas,
      reference: args.reference?.trim() || undefined,
      agreeToCodeOfConduct: args.agreeToCodeOfConduct,
      source: "direct",
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireTier(ctx, "coordinator");
    return await ctx.db.query("joinRequests").order("desc").collect();
  },
});

export const deny = mutation({
  args: { id: v.id("joinRequests") },
  handler: async (ctx, { id }) => {
    const reviewer = await requireTier(ctx, "coordinator");
    await ctx.db.patch(id, { status: "denied", reviewedBy: reviewer._id });
  },
});

/**
 * Approves a request and mints a single-use invite token in one step.
 * Deliberately can't preset "admin" here — granting admin only happens via
 * members.setTier, which itself requires an existing admin. Keeps a
 * coordinator from being able to invite someone straight into admin.
 */
export const approveAndInvite = mutation({
  args: {
    id: v.id("joinRequests"),
    presetTier: v.union(v.literal("initiate"), v.literal("operator"), v.literal("coordinator")),
  },
  handler: async (ctx, { id, presetTier }) => {
    const reviewer = await requireTier(ctx, "coordinator");
    const request = await ctx.db.get(id);
    if (!request) throw new Error("Join request not found.");

    await ctx.db.patch(id, { status: "approved", reviewedBy: reviewer._id });

    const token = randomToken();
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    await ctx.db.insert("inviteTokens", {
      token,
      joinRequestId: id,
      presetEmail: request.loginEmail,
      presetTier,
      presetFocusAreas: request.interestedFocusAreas,
      presetHandle: request.handle,
      createdBy: reviewer._id,
      used: false,
      expiresAt: Date.now() + SEVEN_DAYS_MS,
      createdAt: Date.now(),
    });
    return token;
  },
});
