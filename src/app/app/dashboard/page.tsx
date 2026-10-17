"use client";

import Link from "next/link";
import { useCurrentMember, useMembersList } from "@/services/members/use-members";
import { useOperationsList } from "@/services/operations/use-operations";
import { useChatChannels, useRecentChatMessages } from "@/services/chat/use-chat";

export default function DashboardPage() {
  const member = useCurrentMember();
  const operations = useOperationsList();
  const members = useMembersList();
  const channels = useChatChannels();
  const recentComms = useRecentChatMessages();

  const activeOps = operations?.filter((op) => op.status === "Active") ?? [];
  const activeCount = members?.filter((m) => m.status === "active").length ?? 0;

  return (
    <div className="space-y-10">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-arm-gold">
          Dashboard
        </p>
        <h1 className="mt-2 text-2xl font-bold text-bone">
          Welcome back, {member?.handle ?? "…"}.
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Active Operations" value={activeOps.length} href="/app/operations" />
        <StatCard
          label="Members"
          value={members ? `${activeCount} / ${members.length}` : "…"}
          href="/app/members"
        />
        <StatCard label="Chat Channels" value={channels?.length ?? "…"} href="/app/chat" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-sm border border-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-bone">
              Active Operations
            </h2>
            <Link href="/app/operations" className="text-xs text-arm-gold hover:underline">
              View all
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {activeOps.map((op) => (
              <li key={op._id}>
                <Link
                  href={`/app/operations/${op._id}`}
                  className="block rounded-sm border border-border px-4 py-3 transition-colors hover:border-arm-red/60"
                >
                  <p className="text-sm font-medium text-bone">{op.codename}</p>
                  <p className="mt-1 text-xs text-smoke">{op.focusArea}</p>
                </Link>
              </li>
            ))}
            {operations !== undefined && activeOps.length === 0 && (
              <p className="text-sm text-smoke">No active operations right now.</p>
            )}
          </ul>
        </section>

        <section className="rounded-sm border border-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-bone">
              Recent Comms
            </h2>
            <Link href="/app/chat" className="text-xs text-arm-gold hover:underline">
              Open chat
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {recentComms?.map((msg) => (
              <li key={msg._id} className="text-sm">
                <Link
                  href={`/app/chat/${msg.channelId}`}
                  className="font-mono text-arm-gold hover:underline"
                >
                  #{msg.channelName}
                </Link>{" "}
                <span className="font-medium text-bone">{msg.authorHandle}:</span>{" "}
                <span className="text-smoke">{msg.body}</span>
              </li>
            ))}
            {recentComms?.length === 0 && (
              <p className="text-sm text-smoke">No messages yet.</p>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: string | number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-sm border border-border bg-surface p-6 transition-colors hover:border-arm-red/60"
    >
      <p className="font-mono text-xs uppercase tracking-wider text-smoke">{label}</p>
      <p className="mt-2 text-3xl font-bold text-bone">{value}</p>
    </Link>
  );
}
