"use client";

import { useState, type FormEvent } from "react";
import type { Id } from "@convex/_generated/dataModel";
import { useChatMessages, useSendChatMessage } from "@/services/chat/use-chat";

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
          <div key={msg._id}>
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
          className="flex-1 rounded-sm border border-border bg-void px-4 py-2.5 text-sm text-bone placeholder:text-smoke/50 focus:border-arm-red focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-sm border border-arm-red bg-arm-red px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-bone transition-colors hover:bg-arm-red-glow hover:border-arm-red-glow"
        >
          Send
        </button>
      </form>
    </div>
  );
}
