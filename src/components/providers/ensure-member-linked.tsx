"use client";

import { useEffect } from "react";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";

/**
 * Fires once per session, right after a Google sign-in resolves, to attach
 * the account to any pre-seeded member row (e.g. an admin created ahead of
 * time) that matches by email — see convex/members.ts `ensureLinked`.
 * Renders nothing; mounted globally in the root layout.
 */
export function EnsureMemberLinked() {
  const { isAuthenticated } = useConvexAuth();
  const ensureLinked = useMutation(api.members.ensureLinked);

  useEffect(() => {
    if (isAuthenticated) {
      void ensureLinked();
    }
  }, [isAuthenticated, ensureLinked]);

  return null;
}
