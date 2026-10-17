"use client";

import { useState, type FormEvent } from "react";
import type { Id } from "@convex/_generated/dataModel";
import { useChatMessages, useSendChatMessage } from "@/services/chat/use-chat";
import { MemberAvatar } from "@/components/secure/member-avatar";

export function ChatThread({ channelId }: { channelId: Id<"chatChannels"> }) {
  const messages = useChatMessages(channelId);
  const sendMessage = useSendChatMessage();
  const [draft, setDraft] = useState("");

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    await sendMessage({ channelId, body });
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
        {messages === undefined && <p className="text-sm text-smoke">Loading…</p>}
        {messages?.map((msg) => (
          <div key={msg._id} className="flex items-start gap-3">
            <MemberAvatar handle={msg.authorHandle} avatarUrl={msg.authorAvatarUrl} size={28} />
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-semibold text-bone">{msg.authorHandle}</span>
                <span className="text-xs text-smoke/70">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-sm text-smoke">{msg.body}</p>
            </div>
          </div>
        ))}
        {messages?.length === 0 && (
          <p className="text-sm text-smoke">No messages in this channel yet.</p>
        )}
      </div>

      <form onSubmit={handleSend} className="flex gap-3 border-t border-border p-4">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a message"
          className="flex-1 rounded-sm border border-border bg-void px-4 py-2.5 text-sm text-bone placeholder:text-smoke/50 focus:border-sp-green focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-sm border border-sp-green bg-sp-green px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-on-brand transition-colors hover:bg-sp-green-glow hover:border-sp-green-glow"
        >
          Send
        </button>
      </form>
    </div>
  );
}
