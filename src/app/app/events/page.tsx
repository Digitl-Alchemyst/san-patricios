"use client";

import Link from "next/link";
import { useEventsList, useToggleEventRsvp, useSetEventStatus } from "@/services/events/use-events";
import { useCurrentMember } from "@/services/members/use-members";
import { hasTier } from "@/models/types/member";

const STATUS_STYLES: Record<string, string> = {
  scheduled: "border-sp-green/60 text-sp-green-glow",
  completed: "border-smoke/40 text-smoke",
  cancelled: "border-sp-red/60 text-sp-red",
};

const TYPE_STYLES: Record<string, string> = {
  Training: "border-sp-gold/60 text-sp-gold",
  "Mutual Aid": "border-sp-green/60 text-sp-green-glow",
  "Direct Action": "border-sp-red/60 text-sp-red",
  Patrol: "border-sp-gold/60 text-sp-gold",
  Other: "border-smoke/40 text-smoke",
};

function formatEventTime(startTime: number, endTime?: number) {
  const start = new Date(startTime);
  const dateStr = start.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const startStr = start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (!endTime) return `${dateStr} · ${startStr}`;
  const endStr = new Date(endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return `${dateStr} · ${startStr} – ${endStr}`;
}

export default function EventsPage() {
  const events = useEventsList();
  const member = useCurrentMember();
  const toggleRsvp = useToggleEventRsvp();
  const setStatus = useSetEventStatus();
  const canManageEvents = hasTier(member?.tier, "coordinator");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-sp-gold">
            Events
          </p>
          <h1 className="mt-2 text-2xl font-bold text-bone">Trainings, Patrols &amp; Actions</h1>
        </div>
        {canManageEvents && (
          <Link
            href="/app/events/new"
            className="rounded-sm border border-sp-green bg-sp-green px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-on-brand transition-colors hover:bg-sp-green-glow hover:border-sp-green-glow"
          >
            New Event
          </Link>
        )}
      </div>

      {events === undefined ? (
        <p className="text-sm text-smoke">Loading…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {events.map((event) => (
            <div
              key={event._id}
              className="flex flex-col rounded-sm border border-border bg-surface p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-mono text-base font-semibold text-bone">{event.title}</h2>
                <span
                  className={`shrink-0 rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${STATUS_STYLES[event.status]}`}
                >
                  {event.status}
                </span>
              </div>

              <span
                className={`mt-2 inline-block w-fit rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${TYPE_STYLES[event.type]}`}
              >
                {event.type}
              </span>

              <p className="mt-3 text-sm text-smoke">{event.description}</p>

              <p className="mt-4 text-xs text-smoke/70">
                {formatEventTime(event.startTime, event.endTime)}
              </p>
              {event.location && (
                <p className="mt-1 text-xs text-smoke/70">{event.location}</p>
              )}
              <p className="mt-1 text-xs text-smoke/70">
                Organized by {event.createdByHandle}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleRsvp({ id: event._id })}
                  disabled={event.status !== "scheduled"}
                  className={`rounded-sm border px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    event.isAttending
                      ? "border-sp-green bg-sp-green text-on-brand hover:bg-sp-green-glow hover:border-sp-green-glow"
                      : "border-border text-bone hover:border-sp-green"
                  }`}
                >
                  {event.isAttending ? "Attending" : "RSVP"}
                </button>
                <span className="text-xs text-smoke">
                  {event.rsvpCount} {event.rsvpCount === 1 ? "person" : "people"} going
                </span>

                {canManageEvents && event.status === "scheduled" && (
                  <div className="ml-auto flex gap-2">
                    <button
                      type="button"
                      onClick={() => setStatus({ id: event._id, status: "completed" })}
                      className="rounded-sm border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-smoke transition-colors hover:border-sp-green hover:text-bone"
                    >
                      Mark Completed
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus({ id: event._id, status: "cancelled" })}
                      className="rounded-sm border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-smoke transition-colors hover:border-sp-red hover:text-bone"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {events.length === 0 && (
            <p className="text-sm text-smoke">No events scheduled yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
