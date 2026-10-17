"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useCreateEvent } from "@/services/events/use-events";
import { useCurrentMember } from "@/services/members/use-members";
import { hasTier } from "@/models/types/member";
import { EVENT_TYPES, type EventType } from "@/models/types/event";

export function NewEventForm() {
  const router = useRouter();
  const createEvent = useCreateEvent();
  const member = useCurrentMember();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const title = String(formData.get("title") ?? "").trim();
    const type = String(formData.get("type") ?? "") as EventType;
    const description = String(formData.get("description") ?? "").trim();
    const location = String(formData.get("location") ?? "").trim();
    const startTimeLocal = String(formData.get("startTime") ?? "");
    const endTimeLocal = String(formData.get("endTime") ?? "");

    if (!title || !description || !startTimeLocal) {
      setError("Title, description, and start time are required.");
      return;
    }
    if (!EVENT_TYPES.includes(type)) {
      setError("Choose an event type.");
      return;
    }
    const startTime = new Date(startTimeLocal).getTime();
    if (Number.isNaN(startTime)) {
      setError("Invalid start time.");
      return;
    }
    let endTime: number | undefined;
    if (endTimeLocal) {
      endTime = new Date(endTimeLocal).getTime();
      if (Number.isNaN(endTime)) {
        setError("Invalid end time.");
        return;
      }
    }

    setPending(true);
    try {
      await createEvent({
        title,
        type,
        description,
        location: location || undefined,
        startTime,
        endTime,
      });
      router.push("/app/events");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setPending(false);
    }
  }

  if (member === undefined) {
    return <p className="text-sm text-smoke">Loading…</p>;
  }

  if (!hasTier(member?.tier, "coordinator")) {
    return (
      <p className="rounded-sm border border-sp-red/60 bg-sp-red-dim/30 px-4 py-3 text-sm text-bone">
        You need coordinator tier or higher to create events.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="title" className="block font-mono text-xs uppercase tracking-wider text-smoke">
          Title
        </label>
        <input
          id="title"
          name="title"
          placeholder="De-escalation Training"
          className="mt-2 w-full rounded-sm border border-border bg-void px-4 py-3 text-sm text-bone placeholder:text-smoke/50 focus:border-sp-green focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="type" className="block font-mono text-xs uppercase tracking-wider text-smoke">
          Type
        </label>
        <select
          id="type"
          name="type"
          defaultValue=""
          className="mt-2 w-full rounded-sm border border-border bg-void px-4 py-3 text-sm text-bone focus:border-sp-green focus:outline-none"
        >
          <option value="" disabled>
            Choose one
          </option>
          {EVENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="description" className="block font-mono text-xs uppercase tracking-wider text-smoke">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="What this event is, and what to bring or expect"
          className="mt-2 w-full rounded-sm border border-border bg-void px-4 py-3 text-sm text-bone placeholder:text-smoke/50 focus:border-sp-green focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="location" className="block font-mono text-xs uppercase tracking-wider text-smoke">
          Location <span className="normal-case text-smoke/60">(optional, members only)</span>
        </label>
        <input
          id="location"
          name="location"
          placeholder="Address or meeting point"
          className="mt-2 w-full rounded-sm border border-border bg-void px-4 py-3 text-sm text-bone placeholder:text-smoke/50 focus:border-sp-green focus:outline-none"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="startTime" className="block font-mono text-xs uppercase tracking-wider text-smoke">
            Starts
          </label>
          <input
            id="startTime"
            name="startTime"
            type="datetime-local"
            className="mt-2 w-full rounded-sm border border-border bg-void px-4 py-3 text-sm text-bone focus:border-sp-green focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="endTime" className="block font-mono text-xs uppercase tracking-wider text-smoke">
            Ends <span className="normal-case text-smoke/60">(optional)</span>
          </label>
          <input
            id="endTime"
            name="endTime"
            type="datetime-local"
            className="mt-2 w-full rounded-sm border border-border bg-void px-4 py-3 text-sm text-bone focus:border-sp-green focus:outline-none"
          />
        </div>
      </div>

      {error && (
        <p className="rounded-sm border border-sp-red/60 bg-sp-red-dim/30 px-3 py-2 text-sm text-bone">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-sm border border-sp-green bg-sp-green px-6 py-3 font-mono text-sm font-semibold uppercase tracking-wider text-on-brand transition-colors hover:bg-sp-green-glow hover:border-sp-green-glow disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Creating…" : "Create Event"}
      </button>
    </form>
  );
}
