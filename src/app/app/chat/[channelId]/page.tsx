"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import type { Id } from "@convex/_generated/dataModel";
import { useChatChannels } from "@/services/chat/use-chat";
import { useCurrentMember } from "@/services/members/use-members";
import { hasTier } from "@/models/types/member";
import { ChatChannelList } from "@/components/secure/chat-channel-list";
import { ChatThread } from "@/components/secure/chat-thread";
import { ChannelSettings } from "@/components/secure/channel-settings";

export default function ChatChannelPage({
  params,
}: {
  params: Promise<{ channelId: string }>;
}) {
  const { channelId } = use(params);
  const viewer = useCurrentMember();
  const channels = useChatChannels();

  if (channels === undefined) {
    return <p className="text-sm text-smoke">Loading…</p>;
  }

  const channel = channels.find((c) => c._id === channelId);
  if (!channel) notFound();

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-sp-gold">
          Group Chat
        </p>
        <h1 className="mt-2 text-2xl font-bold text-bone">Comms</h1>
      </div>

      <div className="flex h-[calc(100vh-14rem)] overflow-hidden rounded-sm border border-border">
        <ChatChannelList channels={channels} activeChannelId={channelId} />

        <div className="flex flex-1 flex-col">
          <div className="border-b border-border bg-surface/40 px-5 py-3">
            <p className="text-sm font-semibold text-bone">#{channel.name}</p>
            <p className="text-xs text-smoke">{channel.topic}</p>
          </div>

          {hasTier(viewer?.tier, "admin") && <ChannelSettings channel={channel} />}

          <ChatThread channelId={channelId as Id<"chatChannels">} />
        </div>
      </div>
    </div>
  );
}
