"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useCreateOperation } from "@/services/operations/use-operations";
import { useCurrentMember } from "@/services/members/use-members";
import { hasTier } from "@/models/types/member";
import { FOCUS_AREAS, type FocusArea } from "@/models/types/operation";

export function NewOperationForm() {
  const router = useRouter();
  const createOperation = useCreateOperation();
  const member = useCurrentMember();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const codename = String(formData.get("codename") ?? "").trim();
    const objective = String(formData.get("objective") ?? "").trim();
    const focusArea = String(formData.get("focusArea") ?? "") as FocusArea;
    const targetDate = String(formData.get("targetDate") ?? "");
    const resources = String(formData.get("resources") ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (!codename || !objective || !targetDate) {
      setError("Codename, objective, and target date are required.");
      return;
    }
    if (!FOCUS_AREAS.includes(focusArea)) {
      setError("Choose a focus area.");
      return;
    }

    setPending(true);
    try {
      const id = await createOperation({ codename, objective, focusArea, targetDate, resources });
      router.push(`/app/operations/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setPending(false);
    }
  }

  if (member === undefined) {
    return <p className="text-sm text-smoke">Loading…</p>;
  }

  if (!hasTier(member?.tier, "operator")) {
    return (
      <p className="rounded-sm border border-arm-red/60 bg-arm-red-dim/30 px-4 py-3 text-sm text-bone">
        You need operator tier or higher to create operations.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="codename" className="block font-mono text-xs uppercase tracking-wider text-smoke">
          Codename
        </label>
        <input
          id="codename"
          name="codename"
          placeholder="#OpFirewall"
          className="mt-2 w-full rounded-sm border border-border bg-void px-4 py-3 text-sm text-bone placeholder:text-smoke/50 focus:border-arm-red focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="objective" className="block font-mono text-xs uppercase tracking-wider text-smoke">
          Objective
        </label>
        <textarea
          id="objective"
          name="objective"
          rows={3}
          placeholder="What is this operation trying to accomplish?"
          className="mt-2 w-full rounded-sm border border-border bg-void px-4 py-3 text-sm text-bone placeholder:text-smoke/50 focus:border-arm-red focus:outline-none"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="focusArea" className="block font-mono text-xs uppercase tracking-wider text-smoke">
            Focus Area
          </label>
          <select
            id="focusArea"
            name="focusArea"
            defaultValue=""
            className="mt-2 w-full rounded-sm border border-border bg-void px-4 py-3 text-sm text-bone focus:border-arm-red focus:outline-none"
          >
            <option value="" disabled>
              Choose one
            </option>
            {FOCUS_AREAS.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="targetDate" className="block font-mono text-xs uppercase tracking-wider text-smoke">
            Target Date
          </label>
          <input
            id="targetDate"
            name="targetDate"
            type="date"
            className="mt-2 w-full rounded-sm border border-border bg-void px-4 py-3 text-sm text-bone focus:border-arm-red focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label htmlFor="resources" className="block font-mono text-xs uppercase tracking-wider text-smoke">
          Resources <span className="normal-case text-smoke/60">(one per line)</span>
        </label>
        <textarea
          id="resources"
          name="resources"
          rows={3}
          placeholder={"Supply map link\nDonation intake form"}
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
        className="w-full rounded-sm border border-arm-red bg-arm-red px-6 py-3 font-mono text-sm font-semibold uppercase tracking-wider text-bone transition-colors hover:bg-arm-red-glow hover:border-arm-red-glow disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Creating…" : "Create Operation"}
      </button>
    </form>
  );
}
