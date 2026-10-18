import type { QueryCtx, MutationCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

export const TIER_RANK = { pending: 0, initiate: 1, operator: 2, coordinator: 3, admin: 4 } as const;
export type Tier = keyof typeof TIER_RANK;

/** Plain rank comparison, no auth lookup — for checking a tier you already have in hand. */
export function meetsTier(tier: Tier, minTier: Tier): boolean {
  return TIER_RANK[tier] >= TIER_RANK[minTier];
}

/** Looks up the calling identity's member row by authSubject. Null if signed out or not yet linked. */
export async function getCurrentMember(
  ctx: QueryCtx | MutationCtx,
): Promise<Doc<"members"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return await ctx.db
    .query("members")
    .withIndex("by_authSubject", (q) => q.eq("authSubject", identity.subject))
    .first();
}

/** Throws unless the caller is a linked, active member (any tier above "pending"). */
export async function requireMember(ctx: QueryCtx | MutationCtx): Promise<Doc<"members">> {
  const member = await getCurrentMember(ctx);
  if (!member || member.status !== "active" || member.tier === "pending") {
    throw new Error("Not an active member.");
  }
  return member;
}

/** Throws unless the caller is an active member at or above `minTier`. */
export async function requireTier(
  ctx: QueryCtx | MutationCtx,
  minTier: Tier,
): Promise<Doc<"members">> {
  const member = await requireMember(ctx);
  if (TIER_RANK[member.tier] < TIER_RANK[minTier]) {
    throw new Error(`Requires ${minTier} tier or higher.`);
  }
  return member;
}
