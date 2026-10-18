"use client";

import { useState, type FormEvent } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { FOCUS_AREAS, type FocusArea } from "@/models/types/operation";

export function DirectApplyForm() {
  const submitDirect = useMutation(api.joinRequests.submitDirect);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [interestedFocusAreas, setInterestedFocusAreas] = useState<FocusArea[]>([]);
  const [agreeToCodeOfConduct, setAgreeToCodeOfConduct] = useState(false);

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
    const loginEmail = String(formData.get("loginEmail") ?? "").trim();
    const contact = String(formData.get("contact") ?? "").trim();
    const reference = String(formData.get("reference") ?? "").trim();

    if (!handle) {
      setError("Handle is required.");
      return;
    }
    if (!loginEmail || !loginEmail.includes("@")) {
      setError("A valid login email is required.");
      return;
    }
    if (!agreeToCodeOfConduct) {
      setError("You must agree to the code of conduct to apply.");
      return;
    }

    setPending(true);
    try {
      await submitDirect({
        handle,
        loginEmail,
        contact: contact || undefined,
        interestedFocusAreas,
        reference: reference || undefined,
        agreeToCodeOfConduct,
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
      <div className="rounded-sm border border-sp-gold/60 bg-surface p-6 text-center">
        <p className="font-mono text-xs uppercase tracking-wider text-sp-gold">
          Request received
        </p>
        <p className="mt-3 text-sm leading-relaxed text-bone">
          Thanks. A coordinator will review this and reach out once it&apos;s
          approved.
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
          className="mt-2 w-full rounded-sm border border-border bg-void px-4 py-3 text-sm text-bone placeholder:text-smoke/50 focus:border-sp-green focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="loginEmail" className="block font-mono text-xs uppercase tracking-wider text-smoke">
          Login Email
        </label>
        <input
          id="loginEmail"
          name="loginEmail"
          type="email"
          placeholder="you@example.com"
          className="mt-2 w-full rounded-sm border border-border bg-void px-4 py-3 text-sm text-bone placeholder:text-smoke/50 focus:border-sp-green focus:outline-none"
        />
        <p className="mt-2 text-xs text-smoke/70">
          The account you&apos;ll sign in with once approved — any address
          works, Gmail or not.
        </p>
      </div>

      <div>
        <label htmlFor="contact" className="block font-mono text-xs uppercase tracking-wider text-smoke">
          Secure Contact <span className="normal-case text-smoke/60">(optional)</span>
        </label>
        <input
          id="contact"
          name="contact"
          placeholder="Signal, Session, or another way to reach you"
          className="mt-2 w-full rounded-sm border border-border bg-void px-4 py-3 text-sm text-bone placeholder:text-smoke/50 focus:border-sp-green focus:outline-none"
        />
      </div>

      <div>
        <p className="font-mono text-xs uppercase tracking-wider text-smoke">
          What are you interested in? <span className="normal-case text-smoke/60">(optional)</span>
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
                    ? "border-sp-green bg-sp-green-dim/40 text-bone"
                    : "border-border text-smoke hover:border-sp-green/60 hover:text-bone"
                }`}
              >
                {area}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label htmlFor="reference" className="block font-mono text-xs uppercase tracking-wider text-smoke">
          Who told you about us? <span className="normal-case text-smoke/60">(optional)</span>
        </label>
        <input
          id="reference"
          name="reference"
          placeholder="The member who shared this with you"
          className="mt-2 w-full rounded-sm border border-border bg-void px-4 py-3 text-sm text-bone placeholder:text-smoke/50 focus:border-sp-green focus:outline-none"
        />
      </div>

      <label className="flex items-start gap-3 text-sm text-smoke">
        <input
          type="checkbox"
          checked={agreeToCodeOfConduct}
          onChange={(e) => setAgreeToCodeOfConduct(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-sp-green"
        />
        <span>
          I agree to San Patricios&apos; code of conduct: act in the
          community&apos;s interest, never initiate violence, and never use
          this network to organize or plan anything illegal.
        </span>
      </label>

      {error && (
        <p className="rounded-sm border border-sp-red/60 bg-sp-red-dim/30 px-3 py-2 text-sm text-bone">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-sm border border-sp-green bg-sp-green px-6 py-3 font-mono text-sm font-semibold uppercase tracking-wider text-on-brand transition-colors hover:bg-sp-green-glow hover:border-sp-green-glow disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Request an Account"}
      </button>
    </form>
  );
}
