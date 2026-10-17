import { v } from "convex/values";
import { query, internalMutation } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

/**
 * Brute-force protection for the Credentials (email/password) login path —
 * called from convex/auth.ts's verifyPassword. Two independent limiters run
 * on every attempt: one keyed by the submitted email (stops guessing one
 * account's password) and one keyed by IP (stops hammering many accounts,
 * or enumerating emails, from one source). Either one tripping blocks the
 * attempt. See docs/ARCHITECTURE.md.
 *
 * This intentionally tracks the key regardless of whether an account with
 * that email exists, so the public `status` query below never reveals
 * account existence — only "this key is currently locked out."
 */

export type AttemptResult = { allowed: boolean; retryAfterSeconds?: number };

/**
 * Fixed-window counter with a lockout: once `count` exceeds `maxAttempts`
 * within `windowMs` of the window's start, the key is locked for
 * `lockoutMs`. A fresh window starts automatically once the previous one
 * (and any lockout) has expired. Internal only — the actual enforcement
 * point is convex/auth.ts; nothing public calls this directly.
 */
export const checkAndRecord = internalMutation({
  args: {
    key: v.string(),
    maxAttempts: v.number(),
    windowMs: v.number(),
    lockoutMs: v.number(),
  },
  returns: v.object({ allowed: v.boolean(), retryAfterSeconds: v.optional(v.number()) }),
  handler: async (ctx, { key, maxAttempts, windowMs, lockoutMs }): Promise<AttemptResult> => {
    const now = Date.now();
    const existing: Doc<"loginAttempts"> | null = await ctx.db
      .query("loginAttempts")
      .withIndex("by_key", (q) => q.eq("key", key))
      .first();

    if (existing?.lockedUntil && existing.lockedUntil > now) {
      return { allowed: false, retryAfterSeconds: Math.ceil((existing.lockedUntil - now) / 1000) };
    }

    if (!existing || now - existing.windowStart > windowMs) {
      if (existing) {
        await ctx.db.patch(existing._id, { count: 1, windowStart: now, lockedUntil: undefined });
      } else {
        await ctx.db.insert("loginAttempts", { key, count: 1, windowStart: now });
      }
      return { allowed: true };
    }

    const nextCount = existing.count + 1;
    if (nextCount > maxAttempts) {
      const lockedUntil = now + lockoutMs;
      await ctx.db.patch(existing._id, { count: nextCount, lockedUntil });
      return { allowed: false, retryAfterSeconds: Math.ceil(lockoutMs / 1000) };
    }

    await ctx.db.patch(existing._id, { count: nextCount });
    return { allowed: true };
  },
});

/** Clears a key's counter/lockout — called on a successful password login. */
export const reset = internalMutation({
  args: { key: v.string() },
  returns: v.null(),
  handler: async (ctx, { key }): Promise<null> => {
    const existing: Doc<"loginAttempts"> | null = await ctx.db
      .query("loginAttempts")
      .withIndex("by_key", (q) => q.eq("key", key))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { count: 0, windowStart: Date.now(), lockedUntil: undefined });
    }
    return null;
  },
});

/**
 * Public, read-only — the login form calls this after a failed sign-in to
 * show a specific "try again in N minutes" message instead of a generic
 * one. Safe to expose: it only reports lockout state for the given email
 * key, never whether an account with that email exists.
 */
export const status = query({
  args: { email: v.string() },
  returns: v.object({ locked: v.boolean(), retryAfterSeconds: v.optional(v.number()) }),
  handler: async (ctx, { email }) => {
    const key = `email:${email.toLowerCase()}`;
    const existing = await ctx.db
      .query("loginAttempts")
      .withIndex("by_key", (q) => q.eq("key", key))
      .first();
    const now = Date.now();
    if (existing?.lockedUntil && existing.lockedUntil > now) {
      return { locked: true, retryAfterSeconds: Math.ceil((existing.lockedUntil - now) / 1000) };
    }
    return { locked: false };
  },
});
