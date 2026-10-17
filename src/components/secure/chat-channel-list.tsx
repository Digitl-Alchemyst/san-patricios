"use client";

import Link from "next/link";
import type { Doc } from "@convex/_generated/dataModel";
import { useCurrentMember } from "@/services/members/use-members";
import { hasTier } from "@/models/types/member";

export function ChatChannelList({
  channels,
  activeChannelId,
}: {
  channels: Doc<"chatChannels">[];
  activeChannelId: string;
}) {
  const member = useCurrentMember();
  const canCreateChannel = hasTier(member?.tier, "admin");

  return (
    <aside className="w-56 shrink-0 overflow-y-auto border-r border-border bg-surface/60 p-3">
      <div className="flex items-center justify-between px-2 pb-2">
        <p className="font-mono text-xs uppercase tracking-wider text-smoke">
          Channels
        </p>
        {canCreateChannel && (
          <Link
            href="/app/channels/new"
            title="New channel"
            className="font-mono text-sm text-sp-gold hover:underline"
          >
            +
          </Link>
        )}
      </div>
      <ul className="space-y-1">
        {channels.map((channel) => (
          <li key={channel._id}>
            <Link
              href={`/app/chat/${channel._id}`}
              className={`block rounded-sm px-3 py-2 text-sm transition-colors ${
                channel._id === activeChannelId
                  ? "bg-sp-green-dim/40 text-bone"
                  : "text-smoke hover:bg-surface-2 hover:text-bone"
              }`}
            >
              #{channel.name}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
