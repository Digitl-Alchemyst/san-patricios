"use client";

import Link from "next/link";
import { useOperationsList } from "@/services/operations/use-operations";
import { useCurrentMember } from "@/services/members/use-members";
import { hasTier } from "@/models/types/member";

const STATUS_STYLES: Record<string, string> = {
  Planning: "border-sp-gold/60 text-sp-gold",
  Active: "border-sp-green/60 text-sp-green-glow",
  Completed: "border-smoke/40 text-smoke",
  Archived: "border-smoke/20 text-smoke/60",
};

export default function OperationsPage() {
  const operations = useOperationsList();
  const member = useCurrentMember();
  const canManageOps = hasTier(member?.tier, "operator");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-sp-gold">
            Operations
          </p>
          <h1 className="mt-2 text-2xl font-bold text-bone">Active &amp; Past Ops</h1>
        </div>
        {canManageOps && (
          <Link
            href="/app/operations/new"
            className="rounded-sm border border-sp-green bg-sp-green px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-on-brand transition-colors hover:bg-sp-green-glow hover:border-sp-green-glow"
          >
            New Operation
          </Link>
        )}
      </div>

      {operations === undefined ? (
        <p className="text-sm text-smoke">Loading…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {operations.map((op) => (
            <Link
              key={op._id}
              href={`/app/operations/${op._id}`}
              className="flex flex-col rounded-sm border border-border bg-surface p-6 transition-colors hover:border-sp-green/60"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-mono text-base font-semibold text-bone">
                  {op.codename}
                </h2>
                <span
                  className={`shrink-0 rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${STATUS_STYLES[op.status]}`}
                >
                  {op.status}
                </span>
              </div>
              <p className="mt-2 text-xs uppercase tracking-wider text-smoke">
                {op.focusArea}
              </p>
              <p className="mt-3 line-clamp-3 text-sm text-smoke">{op.objective}</p>
              <p className="mt-4 text-xs text-smoke/70">
                Target: {new Date(op.targetDate).toLocaleDateString()}
              </p>
            </Link>
          ))}
          {operations.length === 0 && (
            <p className="text-sm text-smoke">No operations yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
