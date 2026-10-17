"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useChatChannels } from "@/services/chat/use-chat";

export default function ChatIndexPage() {
  const router = useRouter();
  const channels = useChatChannels();

  useEffect(() => {
    if (channels && channels.length > 0) {
      router.replace(`/app/chat/${channels[0]._id}`);
    }
  }, [channels, router]);

  if (channels === undefined) {
    return <p className="text-sm text-smoke">Loading…</p>;
  }

  if (channels.length === 0) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-smoke">No chat channels exist yet.</p>
        <Link
          href="/app/channels/new"
          className="inline-block rounded-sm border border-sp-green bg-sp-green px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-on-brand transition-colors hover:bg-sp-green-glow hover:border-sp-green-glow"
        >
          Create a Channel
        </Link>
      </div>
    );
  }

  return <p className="text-sm text-smoke">Loading…</p>;
}
