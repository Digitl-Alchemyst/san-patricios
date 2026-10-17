"use client";

import { useMembersList } from "@/services/members/use-members";

export default function MembersPage() {
  const members = useMembersList();

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-arm-gold">
          Members
        </p>
        <h1 className="mt-2 text-2xl font-bold text-bone">Network Directory</h1>
      </div>

      {members === undefined ? (
        <p className="text-sm text-smoke">Loading…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <div
              key={member._id}
              className="flex items-center gap-4 rounded-sm border border-border bg-surface p-4"
            >
              <span
                className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                  member.status === "active" ? "bg-arm-red-glow" : "bg-smoke/40"
                }`}
                aria-hidden
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-bone">{member.handle}</p>
                <p className="truncate text-xs text-smoke">{member.tier}</p>
              </div>
            </div>
          ))}
          {members.length === 0 && (
            <p className="text-sm text-smoke">No members yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
