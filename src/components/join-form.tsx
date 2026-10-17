"use client";

import { useState, type FormEvent } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { FOCUS_AREAS, type FocusArea } from "@/models/types/operation";

export function JoinForm() {
  const submit = useMutation(api.joinRequests.submit);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [interestedFocusAreas, setInterestedFocusAreas] = useState<FocusArea[]>([]);

  function toggleFocusArea(area: FocusArea) {
    setInterestedFocusAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area],
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const handle = String(formData.get("handle") ?? "").trim();
    const contact = String(formData.get("contact") ?? "").trim();
    const cityRegion = String(formData.get("cityRegion") ?? "").trim();
    const experience = String(formData.get("experience") ?? "").trim();
    const statement = String(formData.get("statement") ?? "").trim();
    const reference = String(formData.get("reference") ?? "").trim();

    if (!handle || !contact || !statement) {
      setError("Handle, secure contact, and statement are required.");
      return;
    }

    setPending(true);
    try {
      await submit({
        handle,
        contact,
        cityRegion: cityRegion || undefined,
        interestedFocusAreas,
        experience,
        statement,
        reference: reference || undefined,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-sm border border-arm-gold/60 bg-surface p-6 text-center">
        <p className="font-mono text-xs uppercase tracking-wider text-arm-gold">
          Request received
        </p>
        <p className="mt-3 text-sm leading-relaxed text-bone">
          Your request has been logged. An existing member will reach out
          through a secure channel.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="handle" className="block font-mono text-xs uppercase tracking-wider text-smoke">
          Handle
        </label>
        <input
          id="handle"
          name="handle"
          placeholder="How should we address you?"
          className="mt-2 w-full rounded-sm border border-border bg-void px-4 py-3 text-sm text-bone placeholder:text-smoke/50 focus:border-arm-red focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="contact" className="block font-mono text-xs uppercase tracking-wider text-smoke">
          Secure Contact
        </label>
        <input
          id="contact"
          name="contact"
          placeholder="Signal, Session, or PGP-capable email"
          className="mt-2 w-full rounded-sm border border-border bg-void px-4 py-3 text-sm text-bone placeholder:text-smoke/50 focus:border-arm-red focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="cityRegion" className="block font-mono text-xs uppercase tracking-wider text-smoke">
          City / Region <span className="normal-case text-smoke/60">(optional)</span>
        </label>
        <input
          id="cityRegion"
          name="cityRegion"
          placeholder="So we can connect you with a local crew"
          className="mt-2 w-full rounded-sm border border-border bg-void px-4 py-3 text-sm text-bone placeholder:text-smoke/50 focus:border-arm-red focus:outline-none"
        />
      </div>

      <div>
        <p className="font-mono text-xs uppercase tracking-wider text-smoke">
          What are you interested in?
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {FOCUS_AREAS.map((area) => {
            const active = interestedFocusAreas.includes(area);
            return (
              <button
                key={area}
                type="button"
                onClick={() => toggleFocusArea(area)}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  active
                    ? "border-arm-red bg-arm-red-dim/40 text-bone"
                    : "border-border text-smoke hover:border-arm-red/60 hover:text-bone"
                }`}
              >
                {area}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label htmlFor="experience" className="block font-mono text-xs uppercase tracking-wider text-smoke">
          Prior Organizing Experience <span className="normal-case text-smoke/60">(optional)</span>
        </label>
        <textarea
          id="experience"
          name="experience"
          rows={3}
          placeholder="Any mutual aid, direct action, or movement work you've done"
          className="mt-2 w-full rounded-sm border border-border bg-void px-4 py-3 text-sm text-bone placeholder:text-smoke/50 focus:border-arm-red focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="statement" className="block font-mono text-xs uppercase tracking-wider text-smoke">
          Why do you want to join?
        </label>
        <textarea
          id="statement"
          name="statement"
          rows={4}
          placeholder="Tell us what you're hoping to organize or support."
          className="mt-2 w-full rounded-sm border border-border bg-void px-4 py-3 text-sm text-bone placeholder:text-smoke/50 focus:border-arm-red focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="reference" className="block font-mono text-xs uppercase tracking-wider text-smoke">
          Reference / Vouch <span className="normal-case text-smoke/60">(optional)</span>
        </label>
        <input
          id="reference"
          name="reference"
          placeholder="An existing member or allied group that can vouch for you"
          className="mt-2 w-full rounded-sm border border-border bg-void px-4 py-3 text-sm text-bone placeholder:text-smoke/50 focus:border-arm-red focus:outline-none"
        />
      </div>

      {error && (
        <p className="rounded-sm border border-arm-red/60 bg-arm-red-dim/30 px-3 py-2 text-sm text-bone">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-sm border border-arm-red bg-arm-red px-6 py-3 font-mono text-sm font-semibold uppercase tracking-wider text-bone transition-colors hover:bg-arm-red-glow hover:border-arm-red-glow disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Submit Request"}
      </button>
    </form>
  );
}
