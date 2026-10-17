import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireMember, requireTier } from "./authz";

const focusArea = v.union(
  v.literal("Mutual Aid"),
  v.literal("Community Defense"),
  v.literal("Cultural Education"),
  v.literal("Anti-Racism & Solidarity"),
    v.literal("Decolonization"),
  v.literal("Direct Action Support"),
);

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireMember(ctx);
    return await ctx.db.query("operations").order("desc").collect();
  },
});

export const get = query({
  args: { id: v.id("operations") },
  handler: async (ctx, { id }) => {
    await requireMember(ctx);
    const operation = await ctx.db.get(id);
    if (!operation) return null;

    const comms = await ctx.db
      .query("operationComms")
      .withIndex("by_operation", (q) => q.eq("operationId", id))
      .order("asc")
      .collect();

    const memberIds = [...new Set([...operation.participants, ...comms.map((c) => c.authorId)])];
    const members = await Promise.all(memberIds.map((mid) => ctx.db.get(mid)));
    const handleById = new Map(
      members.filter((m) => m !== null).map((m) => [m._id, m.handle]),
    );

    return {
      operation,
      participantHandles: operation.participants.map((pid) => handleById.get(pid) ?? "unknown"),
      comms: comms.map((c) => ({ ...c, authorHandle: handleById.get(c.authorId) ?? "unknown" })),
    };
  },
});

export const create = mutation({
  args: {
    codename: v.string(),
    objective: v.string(),
    focusArea,
    targetDate: v.string(),
    resources: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Creating/managing operations needs "operator" or higher — see
    // docs/ACCOUNT_TIERS.md.
    const member = await requireTier(ctx, "operator");
    return await ctx.db.insert("operations", {
      ...args,
      status: "Planning",
      participants: [member._id],
      createdAt: Date.now(),
    });
  },
});

export const setStatus = mutation({
  args: {
    id: v.id("operations"),
    status: v.union(v.literal("Planning"), v.literal("Active"), v.literal("Completed"), v.literal("Archived")),
  },
  handler: async (ctx, { id, status }) => {
    await requireTier(ctx, "operator");
    await ctx.db.patch(id, { status });
  },
});

export const join = mutation({
  args: { id: v.id("operations") },
  handler: async (ctx, { id }) => {
    const member = await requireMember(ctx);
    const operation = await ctx.db.get(id);
    if (!operation) throw new Error("Operation not found.");
    if (operation.participants.includes(member._id)) return;
    await ctx.db.patch(id, { participants: [...operation.participants, member._id] });
  },
});

export const addComment = mutation({
  args: { operationId: v.id("operations"), body: v.string() },
  handler: async (ctx, { operationId, body }) => {
    const member = await requireMember(ctx);
    if (!body.trim()) throw new Error("Message can't be empty.");
    await ctx.db.insert("operationComms", {
      operationId,
      authorId: member._id,
      body: body.trim(),
      createdAt: Date.now(),
    });
  },
});
