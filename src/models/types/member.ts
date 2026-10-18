// Mirrors convex/authz.ts's TIER_RANK. This copy is for client-side
// show/hide UI decisions only (e.g. hiding the "New Operation" button) —
// it is NOT a security boundary. Every Convex query/mutation enforces its
// own tier check server-side via convex/authz.ts regardless of what the UI
// shows. See docs/ACCOUNT_TIERS.md.
export const TIER_RANK = {
  pending: 0,
  initiate: 1,
  operator: 2,
  coordinator: 3,
  admin: 4,
} as const;

export type Tier = keyof typeof TIER_RANK;

export function hasTier(tier: Tier | undefined, minTier: Tier): boolean {
  if (!tier) return false;
  return TIER_RANK[tier] >= TIER_RANK[minTier];
}

/** Tiers an admin can assign to a member, or set as a channel's access floor. Excludes "pending". */
export type AssignableTier = Exclude<Tier, "pending">;
export const ASSIGNABLE_TIERS: AssignableTier[] = ["initiate", "operator", "coordinator", "admin"];
