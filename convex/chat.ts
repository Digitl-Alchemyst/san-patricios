import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireMember, requireTier } from "./authz";

export const listChannels = query({
  args: {},
  handler: async (ctx) => {
    await requireMember(ctx);
    return await ctx.db.query("chatChannels").collect();
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
    await requireMember(ctx);
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_channel", (q) => q.eq("channelId", channelId))
      .order("asc")
      .collect();

    const authorIds = [...new Set(messages.map((m) => m.authorId))];
    const authors = await Promise.all(authorIds.map((id) => ctx.db.get(id)));
    const handleById = new Map(authors.filter((a) => a !== null).map((a) => [a._id, a.handle]));

    return messages.map((m) => ({
      ...m,
      authorHandle: handleById.get(m.authorId) ?? "unknown",
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
    const member = await requireMember(ctx);
    if (!body.trim()) throw new Error("Message can't be empty.");
    await ctx.db.insert("chatMessages", {
      channelId,
      authorId: member._id,
      body: body.trim(),
      createdAt: Date.now(),
    });
  },
});
