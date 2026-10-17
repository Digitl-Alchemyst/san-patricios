"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useCreateChatChannel } from "@/services/chat/use-chat";
import { useCurrentMember } from "@/services/members/use-members";
import { hasTier } from "@/models/types/member";

export function NewChannelForm() {
  const router = useRouter();
  const createChannel = useCreateChatChannel();
  const member = useCurrentMember();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const topic = String(formData.get("topic") ?? "").trim();

    if (!name || !topic) {
      setError("Name and topic are required.");
      return;
    }

    setPending(true);
    try {
      const id = await createChannel({ name, topic });
      router.push(`/app/chat/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setPending(false);
    }
  }

  if (member === undefined) {
    return <p className="text-sm text-smoke">Loading…</p>;
  }

  if (!hasTier(member?.tier, "admin")) {
    return (
      <p className="rounded-sm border border-arm-red/60 bg-arm-red-dim/30 px-4 py-3 text-sm text-bone">
        You need admin tier to create channels.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="name" className="block font-mono text-xs uppercase tracking-wider text-smoke">
          Channel Name
        </label>
        <input
          id="name"
          name="name"
          placeholder="legal-support"
          className="mt-2 w-full rounded-sm border border-border bg-void px-4 py-3 text-sm text-bone placeholder:text-smoke/50 focus:border-arm-red focus:outline-none"
        />
        <p className="mt-1 text-xs text-smoke/70">
          Lowercase, hyphens for spaces — shown as #channel-name.
        </p>
      </div>

      <div>
        <label htmlFor="topic" className="block font-mono text-xs uppercase tracking-wider text-smoke">
          Topic
        </label>
        <input
          id="topic"
          name="topic"
          placeholder="What this channel is for"
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
        {pending ? "Creating…" : "Create Channel"}
      </button>
    </form>
  );
}
