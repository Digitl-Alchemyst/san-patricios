"use node";

import { v } from "convex/values";
import bcrypt from "bcryptjs";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import type { AttemptResult } from "./loginAttempts";

type VerifyPasswordResult = { id: Id<"members">; email: string; handle: string } | null;

const SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;

// Brute-force protection (convex/loginAttempts.ts). Two independent
// limiters: per-email (stops guessing one account's password) and per-IP
// (stops hammering many accounts, or guessing invite tokens, from one
// source). Either tripping blocks the attempt. See docs/ARCHITECTURE.md.
const EMAIL_MAX_ATTEMPTS = 5;
const EMAIL_WINDOW_MS = 15 * 60 * 1000;
const EMAIL_LOCKOUT_MS = 15 * 60 * 1000;
const IP_MAX_ATTEMPTS = 20;
const IP_WINDOW_MS = 10 * 60 * 1000;
const IP_LOCKOUT_MS = 10 * 60 * 1000;

/**
 * Password hashing/verification needs bcryptjs, which needs the Node.js
 * runtime — Convex's default (non-Node) runtime can't run it, hence this
 * file being a "use node" action file. Actions can't touch ctx.db directly,
 * so the actual reads/writes are internal query/mutation functions in
 * convex/members.ts, convex/inviteTokens.ts, and convex/loginAttempts.ts,
 * called via ctx.runQuery / ctx.runMutation. Called from
 * src/lib/auth/config.ts's Credentials provider (verifyPassword) and
 * src/components/signup-token-view.tsx (consumeInviteWithPassword). See
 * docs/ARCHITECTURE.md.
 */

export const verifyPassword = action({
  args: { email: v.string(), password: v.string(), ip: v.optional(v.string()) },
  returns: v.union(
    v.object({ id: v.id("members"), email: v.string(), handle: v.string() }),
    v.null(),
  ),
  handler: async (ctx, { email, password, ip }): Promise<VerifyPasswordResult> => {
    const emailKey = `email:${email.toLowerCase()}`;
    const ipKey = `ip:${ip ?? "unknown"}`;

    const ipCheck: AttemptResult = await ctx.runMutation(internal.loginAttempts.checkAndRecord, {
      key: ipKey,
      maxAttempts: IP_MAX_ATTEMPTS,
      windowMs: IP_WINDOW_MS,
      lockoutMs: IP_LOCKOUT_MS,
    });
    if (!ipCheck.allowed) return null;

    const emailCheck: AttemptResult = await ctx.runMutation(internal.loginAttempts.checkAndRecord, {
      key: emailKey,
      maxAttempts: EMAIL_MAX_ATTEMPTS,
      windowMs: EMAIL_WINDOW_MS,
      lockoutMs: EMAIL_LOCKOUT_MS,
    });
    if (!emailCheck.allowed) return null;

    const member: Doc<"members"> | null = await ctx.runQuery(
      internal.members.getByEmailForAuth,
      { email },
    );
    if (!member || !member.passwordHash) return null;
    if (member.status !== "active") return null;

    const ok: boolean = await bcrypt.compare(password, member.passwordHash);
    if (!ok) return null;

    // A correct password is strong evidence this is the legitimate owner —
    // don't keep counting their future attempts in this window. The IP
    // counter is deliberately NOT reset: one successful login shouldn't
    // reopen the budget for brute-forcing other accounts from that IP.
    await ctx.runMutation(internal.loginAttempts.reset, { key: emailKey });

    return { id: member._id, email: member.email ?? email, handle: member.handle };
  },
});

export const consumeInviteWithPassword = action({
  args: { token: v.string(), email: v.string(), password: v.string() },
  returns: v.id("members"),
  handler: async (ctx, { token, email, password }): Promise<Id<"members">> => {
    // No IP-based rate limiting here (unlike verifyPassword): this is
    // called directly from a Client Component with no real Request object
    // to pull an IP from, so every caller would pool under one "unknown"
    // bucket and risk locking out unrelated visitors. Not a brute-force
    // risk anyway — the token itself is 192 bits of entropy.
    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
    }
    if (!email.includes("@")) {
      throw new Error("Enter a valid email.");
    }
    // Normalized once here, stored lowercase — getByEmailForAuth/ensureLinked
    // both lowercase on lookup too, so this stays consistent either way.
    const normalizedEmail = email.toLowerCase();

    const invite: Doc<"inviteTokens"> | null = await ctx.runQuery(
      internal.inviteTokens.getValidForAuth,
      { token },
    );
    if (!invite) throw new Error("This invite link is invalid or has expired.");

    const existing: Doc<"members"> | null = await ctx.runQuery(
      internal.members.getByEmailForAuth,
      { email: normalizedEmail },
    );
    if (existing) throw new Error("An account with that email already exists — try logging in instead.");

    const passwordHash: string = await bcrypt.hash(password, SALT_ROUNDS);

    return await ctx.runMutation(internal.inviteTokens.createMemberWithPassword, {
      inviteId: invite._id,
      email: normalizedEmail,
      passwordHash,
      presetHandle: invite.presetHandle,
      presetTier: invite.presetTier,
      presetFocusAreas: invite.presetFocusAreas,
      createdBy: invite.createdBy,
    });
  },
});
