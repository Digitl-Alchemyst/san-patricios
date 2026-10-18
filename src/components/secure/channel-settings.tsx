"use client";

import { useState } from "react";
import type { Doc } from "@convex/_generated/dataModel";
import { ASSIGNABLE_TIERS } from "@/models/types/member";
import {
  useChannelTimeouts,
  useRemoveTimeout,
  useUpdateChannelSettings,
} from "@/services/chat/use-chat";

export function ChannelSettings({ channel }: { channel: Doc<"chatChannels"> }) {
  const updateSettings = useUpdateChannelSettings();
  const timeouts = useChannelTimeouts(channel._id);
  const removeTimeout = useRemoveTimeout();
  const [saving, setSaving] = useState(false);

  async function handleMinTierChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSaving(true);
    try {
      await updateSettings({
        channelId: channel._id,
        minTier: e.target.value as "none" | (typeof ASSIGNABLE_TIERS)[number],
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border-b border-border bg-surface/60 px-5 py-3 text-xs">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono uppercase tracking-wider text-smoke">
          Access floor
        </span>
        <select
          value={channel.minTier ?? "none"}
          onChange={handleMinTierChange}
          disabled={saving}
          className="rounded-sm border border-border bg-void px-2 py-1 text-bone focus:border-sp-green focus:outline-none"
        >
          <option value="none">Any active member</option>
          {ASSIGNABLE_TIERS.map((tier) => (
            <option key={tier} value={tier}>
              {tier}+
            </option>
          ))}
        </select>
      </div>

      {timeouts && timeouts.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="font-mono uppercase tracking-wider text-smoke">
            Timed out:
          </span>
          {timeouts.map((t) => (
            <span
              key={t._id}
              className="flex items-center gap-1.5 rounded-full border border-sp-red/60 bg-sp-red-dim/30 px-2 py-0.5 text-bone"
            >
              {t.memberHandle} until {new Date(t.expiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              <button
                type="button"
                onClick={() => removeTimeout({ channelId: channel._id, memberId: t.memberId })}
                className="text-smoke hover:text-bone"
                aria-label={`Remove timeout for ${t.memberHandle}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
