"use client";

import { useState, type FormEvent } from "react";
import type { Id } from "@convex/_generated/dataModel";
import {
  useChatMessages,
  useDeleteChatMessage,
  useSendChatMessage,
  useTimeoutMember,
} from "@/services/chat/use-chat";
import { useCurrentMember } from "@/services/members/use-members";
import { MemberAvatar } from "@/components/secure/member-avatar";
import { hasTier } from "@/models/types/member";

const TIMEOUT_OPTIONS: { label: string; minutes: number }[] = [
  { label: "10m", minutes: 10 },
  { label: "1h", minutes: 60 },
  { label: "24h", minutes: 60 * 24 },
  { label: "7d", minutes: 60 * 24 * 7 },
];

export function ChatThread({ channelId }: { channelId: Id<"chatChannels"> }) {
  const viewer = useCurrentMember();
  const isAdmin = hasTier(viewer?.tier, "admin");
  const messages = useChatMessages(channelId);
  const sendMessage = useSendChatMessage();
  const deleteMessage = useDeleteChatMessage();
  const timeoutMember = useTimeoutMember();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    setError(null);
    try {
      await sendMessage({ channelId, body });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send that.");
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
        {messages === undefined && <p className="text-sm text-smoke">Loading…</p>}
        {messages?.map((msg) => (
          <div key={msg._id} className="group flex items-start gap-3">
            <MemberAvatar handle={msg.authorHandle} avatarUrl={msg.authorAvatarUrl} size={28} />
            <div className="min-w-0 flex-1">
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
            {isAdmin && (
              <div className="flex items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                {TIMEOUT_OPTIONS.map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    title={`Time out ${msg.authorHandle} for ${opt.label}`}
                    onClick={() =>
                      timeoutMember({ channelId, memberId: msg.authorId, durationMinutes: opt.minutes })
                    }
                    className="rounded-sm border border-border px-1.5 py-0.5 text-[10px] text-smoke hover:border-sp-gold hover:text-sp-gold"
                  >
                    {opt.label}
                  </button>
                ))}
                <button
                  type="button"
                  title="Delete message"
                  onClick={() => deleteMessage({ messageId: msg._id })}
                  className="rounded-sm border border-border px-1.5 py-0.5 text-[10px] text-smoke hover:border-sp-red hover:text-sp-red"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
        {messages?.length === 0 && (
          <p className="text-sm text-smoke">No messages in this channel yet.</p>
        )}
      </div>

      {error && (
        <p className="border-t border-sp-red/60 bg-sp-red-dim/30 px-5 py-2 text-xs text-bone">
          {error}
        </p>
      )}

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
