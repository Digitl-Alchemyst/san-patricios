import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireMember, requireTier } from "./authz";

const eventType = v.union(
  v.literal("Training"),
  v.literal("Mutual Aid"),
  v.literal("Direct Action"),
  v.literal("Patrol"),
  v.literal("Other"),
);

/** Every scheduled/completed event, soonest first, with the creator's handle and the caller's own RSVP status attached. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const member = await requireMember(ctx);
    const events = await ctx.db.query("events").withIndex("by_startTime").order("asc").collect();

    const creatorIds = [...new Set(events.map((e) => e.createdBy))];
    const creators = await Promise.all(creatorIds.map((id) => ctx.db.get(id)));
    const handleById = new Map(creators.filter((c) => c !== null).map((c) => [c._id, c.handle]));

    return events.map((e) => ({
      ...e,
      createdByHandle: handleById.get(e.createdBy) ?? "unknown",
      rsvpCount: e.rsvps.length,
      isAttending: e.rsvps.includes(member._id),
    }));
  },
});

/**
 * Creating events (training, mutual aid, direct action, patrols, etc.) needs
 * "coordinator" or higher — admins and coordinators only, per the request
 * this feature was built for.
 */
export const create = mutation({
  args: {
    title: v.string(),
    type: eventType,
    description: v.string(),
    location: v.optional(v.string()),
    startTime: v.number(),
    endTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const member = await requireTier(ctx, "coordinator");
    if (!args.title.trim()) throw new Error("Title is required.");
    if (args.endTime !== undefined && args.endTime < args.startTime) {
      throw new Error("End time can't be before start time.");
    }
    return await ctx.db.insert("events", {
      ...args,
      status: "scheduled",
      createdBy: member._id,
      rsvps: [],
      createdAt: Date.now(),
    });
  },
});

export const setStatus = mutation({
  args: {
    id: v.id("events"),
    status: v.union(v.literal("scheduled"), v.literal("cancelled"), v.literal("completed")),
  },
  handler: async (ctx, { id, status }) => {
    await requireTier(ctx, "coordinator");
    await ctx.db.patch(id, { status });
  },
});

/** Toggles the calling member's own RSVP — any active member, not just coordinators. */
export const toggleRsvp = mutation({
  args: { id: v.id("events") },
  handler: async (ctx, { id }) => {
    const member = await requireMember(ctx);
    const event = await ctx.db.get(id);
    if (!event) throw new Error("Event not found.");

    const attending = event.rsvps.includes(member._id);
    await ctx.db.patch(id, {
      rsvps: attending
        ? event.rsvps.filter((mid) => mid !== member._id)
        : [...event.rsvps, member._id],
    });
  },
});
