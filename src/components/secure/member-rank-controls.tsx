"use client";

import { useState } from "react";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { ASSIGNABLE_TIERS, type AssignableTier } from "@/models/types/member";
import { useSetTier, useSetRoleTitle } from "@/services/members/use-members";

export function MemberRankControls({
  member,
}: {
  member: Pick<Doc<"members">, "_id" | "tier" | "roleTitle">;
}) {
  const setTier = useSetTier();
  const setRoleTitle = useSetRoleTitle();
  const [roleTitle, setRoleTitleDraft] = useState(member.roleTitle ?? "");

  async function handleTierChange(e: React.ChangeEvent<HTMLSelectElement>) {
    await setTier({ memberId: member._id as Id<"members">, tier: e.target.value as AssignableTier });
  }

  async function handleRoleTitleBlur() {
    const trimmed = roleTitle.trim();
    if (trimmed === (member.roleTitle ?? "")) return;
    await setRoleTitle({ memberId: member._id as Id<"members">, roleTitle: trimmed || undefined });
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <select
        value={member.tier}
        onChange={handleTierChange}
        className="rounded-sm border border-border bg-void px-2 py-1 text-xs text-bone focus:border-sp-green focus:outline-none"
      >
        {ASSIGNABLE_TIERS.map((tier) => (
          <option key={tier} value={tier}>
            {tier}
          </option>
        ))}
      </select>
      <input
        value={roleTitle}
        onChange={(e) => setRoleTitleDraft(e.target.value)}
        onBlur={handleRoleTitleBlur}
        placeholder="Role title"
        className="w-32 rounded-sm border border-border bg-void px-2 py-1 text-xs text-bone placeholder:text-smoke/50 focus:border-sp-green focus:outline-none"
      />
    </div>
  );
}
