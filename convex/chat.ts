import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireMember, requireTier, meetsTier } from "./authz";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

const assignableTier = v.union(
  v.literal("initiate"),
  v.literal("operator"),
  v.literal("coordinator"),
  v.literal("admin"),
);

/**
 * Loads the channel and enforces its `minTier` gate (admins always pass).
 * Shared by listMessages/sendMessage so direct navigation to a gated
 * channel's URL can't bypass the same check listChannels applies for display.
 */
async function requireChannelAccess(
  ctx: QueryCtx | MutationCtx,
  channelId: Id<"chatChannels">,
): Promise<{ member: Doc<"members">; channel: Doc<"chatChannels"> }> {
  const member = await requireMember(ctx);
  const channel = await ctx.db.get(channelId);
  if (!channel) throw new Error("Channel not found.");
  if (channel.minTier && member.tier !== "admin" && !meetsTier(member.tier, channel.minTier)) {
    throw new Error(`This channel requires ${channel.minTier} tier or higher.`);
  }
  return { member, channel };
}

export const listChannels = query({
  args: {},
  handler: async (ctx) => {
    const member = await requireMember(ctx);
    const channels = await ctx.db.query("chatChannels").collect();
    return channels.filter(
      (c) => member.tier === "admin" || !c.minTier || meetsTier(member.tier, c.minTier),
    );
  },
});

/** Admin-only — see docs/ACCOUNT_TIERS.md. */
export const createChannel = mutation({
  args: { name: v.string(), topic: v.string() },
  handler: async (ctx, { name, topic }) => {
    await requireTier(ctx, "admin");

    // Normalized the same way the seeded channels are named: lowercase,
    // hyphenated, no "#" (the UI prefixes that when displaying).
    const normalizedName = name
      .trim()
      .toLowerCase()
      .replace(/^#/, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    if (!normalizedName) throw new Error("Enter a channel name.");
    if (!topic.trim()) throw new Error("Enter a topic.");

    const existing = await ctx.db
      .query("chatChannels")
      .withIndex("by_name", (q) => q.eq("name", normalizedName))
      .first();
    if (existing) throw new Error(`#${normalizedName} already exists.`);

    return await ctx.db.insert("chatChannels", { name: normalizedName, topic: topic.trim() });
  },
});

export const listMessages = query({
  args: { channelId: v.id("chatChannels") },
  handler: async (ctx, { channelId }) => {
    await requireChannelAccess(ctx, channelId);
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_channel", (q) => q.eq("channelId", channelId))
      .order("asc")
      .collect();

    const authorIds = [...new Set(messages.map((m) => m.authorId))];
    const authors = await Promise.all(authorIds.map((id) => ctx.db.get(id)));
    const authorById = new Map(
      authors
        .filter((a) => a !== null)
        .map((a) => [a._id, { handle: a.handle, avatarUrl: a.avatarUrl }]),
    );

    return messages.map((m) => ({
      ...m,
      authorHandle: authorById.get(m.authorId)?.handle ?? "unknown",
      authorAvatarUrl: authorById.get(m.authorId)?.avatarUrl,
    }));
  },
});

/** Most recent messages across every channel, for the dashboard preview. */
export const recentMessages = query({
  args: {},
  handler: async (ctx) => {
    await requireMember(ctx);
    const recent = await ctx.db.query("chatMessages").order("desc").take(5);

    const [authors, channels] = await Promise.all([
      Promise.all([...new Set(recent.map((m) => m.authorId))].map((id) => ctx.db.get(id))),
      Promise.all([...new Set(recent.map((m) => m.channelId))].map((id) => ctx.db.get(id))),
    ]);
    const handleById = new Map(authors.filter((a) => a !== null).map((a) => [a._id, a.handle]));
    const channelById = new Map(channels.filter((c) => c !== null).map((c) => [c._id, c.name]));

    return recent.map((m) => ({
      ...m,
      authorHandle: handleById.get(m.authorId) ?? "unknown",
      channelName: channelById.get(m.channelId) ?? "unknown",
    }));
  },
});

export const sendMessage = mutation({
  args: { channelId: v.id("chatChannels"), body: v.string() },
  handler: async (ctx, { channelId, body }) => {
    const { member } = await requireChannelAccess(ctx, channelId);
    if (!body.trim()) throw new Error("Message can't be empty.");

    const timeout = await ctx.db
      .query("chatTimeouts")
      .withIndex("by_channel_member", (q) => q.eq("channelId", channelId).eq("memberId", member._id))
      .first();
    if (timeout && timeout.expiresAt > Date.now()) {
      throw new Error(
        `You're timed out in this channel until ${new Date(timeout.expiresAt).toLocaleString()}.`,
      );
    }

    await ctx.db.insert("chatMessages", {
      channelId,
      authorId: member._id,
      body: body.trim(),
      createdAt: Date.now(),
    });
  },
});

/** Admin-only — changes who can view/post in a channel. */
export const updateChannelSettings = mutation({
  args: {
    channelId: v.id("chatChannels"),
    // "none" clears the gate (open to any active member).
    minTier: v.union(v.literal("none"), assignableTier),
  },
  handler: async (ctx, { channelId, minTier }) => {
    await requireTier(ctx, "admin");
    await ctx.db.patch(channelId, { minTier: minTier === "none" ? undefined : minTier });
  },
});

/** Admin-only moderation — removes a message outright. */
export const deleteMessage = mutation({
  args: { messageId: v.id("chatMessages") },
  handler: async (ctx, { messageId }) => {
    await requireTier(ctx, "admin");
    await ctx.db.delete(messageId);
  },
});

/** Admin-only moderation — upserts a single timeout row per (channel, member). */
export const timeoutMember = mutation({
  args: {
    channelId: v.id("chatChannels"),
    memberId: v.id("members"),
    durationMinutes: v.number(),
  },
  handler: async (ctx, { channelId, memberId, durationMinutes }) => {
    const admin = await requireTier(ctx, "admin");
    if (durationMinutes <= 0) throw new Error("Duration must be positive.");

    const target = await ctx.db.get(memberId);
    if (!target) throw new Error("Member not found.");
    if (target.tier === "admin") throw new Error("Can't time out an admin.");

    const expiresAt = Date.now() + durationMinutes * 60_000;
    const existing = await ctx.db
      .query("chatTimeouts")
      .withIndex("by_channel_member", (q) => q.eq("channelId", channelId).eq("memberId", memberId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { expiresAt, createdBy: admin._id, createdAt: Date.now() });
    } else {
      await ctx.db.insert("chatTimeouts", {
        channelId,
        memberId,
        expiresAt,
        createdBy: admin._id,
        createdAt: Date.now(),
      });
    }
  },
});

/** Admin-only — lifts a timeout early. */
export const removeTimeout = mutation({
  args: { channelId: v.id("chatChannels"), memberId: v.id("members") },
  handler: async (ctx, { channelId, memberId }) => {
    await requireTier(ctx, "admin");
    const existing = await ctx.db
      .query("chatTimeouts")
      .withIndex("by_channel_member", (q) => q.eq("channelId", channelId).eq("memberId", memberId))
      .first();
    if (existing) await ctx.db.delete(existing._id);
  },
});

/** Admin-only — currently-active timeouts in a channel, for the settings panel. */
export const listTimeouts = query({
  args: { channelId: v.id("chatChannels") },
  handler: async (ctx, { channelId }) => {
    await requireTier(ctx, "admin");
    const rows = await ctx.db
      .query("chatTimeouts")
      .withIndex("by_channel", (q) => q.eq("channelId", channelId))
      .collect();
    const active = rows.filter((r) => r.expiresAt > Date.now());

    const members = await Promise.all(active.map((r) => ctx.db.get(r.memberId)));
    const handleById = new Map(members.filter((m) => m !== null).map((m) => [m._id, m.handle]));

    return active.map((r) => ({
      ...r,
      memberHandle: handleById.get(r.memberId) ?? "unknown",
    }));
  },
});
