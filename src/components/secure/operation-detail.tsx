"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Id } from "@convex/_generated/dataModel";
import {
  useOperation,
  useJoinOperation,
  useAddOperationComment,
} from "@/services/operations/use-operations";

const STATUS_STYLES: Record<string, string> = {
  Planning: "border-arm-gold/60 text-arm-gold",
  Active: "border-arm-red/60 text-arm-red-glow",
  Completed: "border-smoke/40 text-smoke",
  Archived: "border-smoke/20 text-smoke/60",
};

export function OperationDetail({ id }: { id: string }) {
  const result = useOperation(id as Id<"operations">);
  const joinOperation = useJoinOperation();
  const addComment = useAddOperationComment();
  const [comment, setComment] = useState("");

  if (result === undefined) {
    return <p className="text-sm text-smoke">Loading…</p>;
  }
  if (result === null) {
    notFound();
  }

  const { operation, participantHandles, comms } = result;

  async function handleComment(e: FormEvent) {
    e.preventDefault();
    const body = comment.trim();
    if (!body) return;
    setComment("");
    await addComment({ operationId: operation._id, body });
  }

  return (
    <div className="space-y-10">
      <div>
        <Link href="/app/operations" className="text-xs text-arm-gold hover:underline">
          ← All operations
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-bone">{operation.codename}</h1>
          <span
            className={`rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${STATUS_STYLES[operation.status]}`}
          >
            {operation.status}
          </span>
        </div>
        <p className="mt-1 font-mono text-xs uppercase tracking-wider text-smoke">
          {operation.focusArea} &middot; Target {new Date(operation.targetDate).toLocaleDateString()}
        </p>
      </div>

      <section>
        <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-bone">
          Objective
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-smoke">{operation.objective}</p>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-bone">
            Resources
          </h2>
          {operation.resources.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {operation.resources.map((resource) => (
                <li
                  key={resource}
                  className="rounded-sm border border-border bg-surface px-4 py-2 text-sm text-smoke"
                >
                  {resource}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-smoke">No resources listed yet.</p>
          )}
        </section>

        <section>
          <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-bone">
            Participants
          </h2>
          {participantHandles.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {participantHandles.map((handle, i) => (
                <li
                  key={`${handle}-${i}`}
                  className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-bone"
                >
                  {handle}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-smoke">No participants yet.</p>
          )}
          <button
            type="button"
            onClick={() => joinOperation({ id: operation._id })}
            className="mt-4 rounded-sm border border-arm-red px-4 py-2 font-mono text-xs uppercase tracking-wider text-bone transition-colors hover:bg-arm-red-dim/40"
          >
            Join Operation
          </button>
        </section>
      </div>

      <section>
        <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-bone">
          Comms
        </h2>
        <ul className="mt-3 space-y-3">
          {comms.map((msg) => (
            <li key={msg._id} className="rounded-sm border border-border bg-surface px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-bone">{msg.authorHandle}</span>
                <span className="text-xs text-smoke/70">
                  {new Date(msg.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="mt-1 text-sm text-smoke">{msg.body}</p>
            </li>
          ))}
          {comms.length === 0 && <p className="text-sm text-smoke">No comms logged yet.</p>}
        </ul>

        <form onSubmit={handleComment} className="mt-4 flex gap-3">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Post an update"
            className="flex-1 rounded-sm border border-border bg-void px-4 py-2.5 text-sm text-bone placeholder:text-smoke/50 focus:border-arm-red focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-sm border border-arm-red bg-arm-red px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-bone transition-colors hover:bg-arm-red-glow hover:border-arm-red-glow"
          >
            Post
          </button>
        </form>
      </section>
    </div>
  );
}
