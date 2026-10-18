"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

export default function JoinRequestsPage() {
  const requests = useQuery(api.joinRequests.list);
  const approveAndInvite = useMutation(api.joinRequests.approveAndInvite);
  const deny = useMutation(api.joinRequests.deny);
  const [issuedLinks, setIssuedLinks] = useState<Record<string, string>>({});

  async function handleApprove(
    id: Id<"joinRequests">,
    presetTier: "initiate" | "operator" | "coordinator",
  ) {
    const token = await approveAndInvite({ id, presetTier });
    const link = `${window.location.origin}/signup/${token}`;
    setIssuedLinks((prev) => ({ ...prev, [id]: link }));
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-sp-gold">
          Join Requests
        </p>
        <h1 className="mt-2 text-2xl font-bold text-bone">Review Applicants</h1>
      </div>

      {requests === undefined ? (
        <p className="text-sm text-smoke">Loading…</p>
      ) : requests.length === 0 ? (
        <p className="text-sm text-smoke">No join requests.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req._id} className="rounded-sm border border-border bg-surface p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-mono text-base font-semibold text-bone">{req.handle}</h2>
                <div className="flex items-center gap-2">
                  {req.source === "direct" && (
                    <span className="rounded-sm border border-sp-gold/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-sp-gold">
                      Direct / unlisted
                    </span>
                  )}
                  <span
                    className={`rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                      req.status === "pending"
                        ? "border-sp-gold/60 text-sp-gold"
                        : req.status === "approved"
                          ? "border-sp-green/60 text-sp-green-glow"
                          : "border-smoke/40 text-smoke"
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
              </div>

              <dl className="mt-3 space-y-1 text-sm text-smoke">
                <div>
                  <dt className="inline font-mono text-xs uppercase tracking-wider text-smoke/70">
                    Login Email:{" "}
                  </dt>
                  <dd className="inline text-bone">{req.loginEmail}</dd>
                </div>
                {req.contact && (
                  <div>
                    <dt className="inline font-mono text-xs uppercase tracking-wider text-smoke/70">
                      Contact:{" "}
                    </dt>
                    <dd className="inline text-bone">{req.contact}</dd>
                  </div>
                )}
                {req.cityRegion && (
                  <div>
                    <dt className="inline font-mono text-xs uppercase tracking-wider text-smoke/70">
                      Location:{" "}
                    </dt>
                    <dd className="inline text-bone">{req.cityRegion}</dd>
                  </div>
                )}
                {req.heritageConnection && (
                  <div>
                    <dt className="inline font-mono text-xs uppercase tracking-wider text-smoke/70">
                      Connection:{" "}
                    </dt>
                    <dd className="inline text-bone">{req.heritageConnection}</dd>
                  </div>
                )}
                {req.interestedFocusAreas.length > 0 && (
                  <div>
                    <dt className="inline font-mono text-xs uppercase tracking-wider text-smoke/70">
                      Interested in:{" "}
                    </dt>
                    <dd className="inline text-bone">{req.interestedFocusAreas.join(", ")}</dd>
                  </div>
                )}
                {req.availability && (
                  <div>
                    <dt className="inline font-mono text-xs uppercase tracking-wider text-smoke/70">
                      Availability:{" "}
                    </dt>
                    <dd className="inline text-bone">{req.availability}</dd>
                  </div>
                )}
              </dl>

              {req.experience && (
                <p className="mt-3 text-sm text-smoke">
                  <span className="font-mono text-xs uppercase tracking-wider text-smoke/70">
                    Experience:{" "}
                  </span>
                  {req.experience}
                </p>
              )}
              {req.statement && (
                <p className="mt-3 text-sm text-smoke">
                  <span className="font-mono text-xs uppercase tracking-wider text-smoke/70">
                    Statement:{" "}
                  </span>
                  {req.statement}
                </p>
              )}
              {req.reference && (
                <p className="mt-3 text-sm text-smoke">
                  <span className="font-mono text-xs uppercase tracking-wider text-smoke/70">
                    {req.source === "direct" ? "Who told them about us:" : "Reference:"}{" "}
                  </span>
                  {req.reference}
                </p>
              )}
              <p className="mt-3 text-xs text-smoke/70">
                Code of conduct agreed: {req.agreeToCodeOfConduct ? "Yes" : "No"}
              </p>

              {req.status === "pending" && (
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => handleApprove(req._id, "initiate")}
                    className="rounded-sm border border-sp-green bg-sp-green px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-on-brand transition-colors hover:bg-sp-green-glow hover:border-sp-green-glow"
                  >
                    Approve as Initiate
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprove(req._id, "operator")}
                    className="rounded-sm border border-sp-green px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-bone transition-colors hover:bg-sp-green-dim/40"
                  >
                    Approve as Operator
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprove(req._id, "coordinator")}
                    className="rounded-sm border border-sp-gold px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-sp-gold transition-colors hover:bg-sp-gold/10"
                  >
                    Approve as Coordinator
                  </button>
                  <button
                    type="button"
                    onClick={() => deny({ id: req._id })}
                    className="rounded-sm border border-border px-4 py-2 font-mono text-xs uppercase tracking-wider text-smoke transition-colors hover:border-sp-red hover:text-bone"
                  >
                    Deny
                  </button>
                </div>
              )}

              {issuedLinks[req._id] && (
                <div className="mt-4 rounded-sm border border-sp-gold/60 bg-sp-gold/10 px-4 py-3">
                  <p className="font-mono text-xs uppercase tracking-wider text-sp-gold">
                    Invite link — send this over a secure channel
                  </p>
                  <p className="mt-1 break-all font-mono text-xs text-bone">
                    {issuedLinks[req._id]}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
