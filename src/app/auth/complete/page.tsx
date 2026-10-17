"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";

/**
 * Google sign-in's OAuth callback redirects straight here (not to
 * /app/dashboard directly) specifically to fix a real bug: a pre-seeded
 * account (e.g. the initial admin) isn't linked to its Google identity
 * until members.ensureLinked runs — and that's a client-side mutation, so
 * it needs a page to actually mount and run on before the server-side
 * membership check in src/app/app/layout.tsx gets a chance to run. Sending
 * Google sign-ins straight to /app/dashboard raced that: the layout's
 * check would find no linked member yet, bounce to /login — which used to
 * bounce straight back to /app/dashboard because it had a session,
 * creating an infinite redirect loop. See src/proxy.ts and
 * docs/ARCHITECTURE.md.
 *
 * Harmless/idempotent for an already-linked returning member too — the
 * mutation is a quick no-op match in that case.
 */
export default function AuthCompletePage() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useConvexAuth();
  const ensureLinked = useMutation(api.members.ensureLinked);
  const ranRef = useRef(false);

  useEffect(() => {
    if (isLoading || ranRef.current) return;
    ranRef.current = true;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    ensureLinked()
      .then((memberId) => {
        if (memberId) {
          router.replace("/app/dashboard");
        } else {
          // No pre-seeded row matched this account's email, and it wasn't
          // already linked — there's no member record for this Google
          // account at all. Say so directly instead of silently bouncing
          // through /app/dashboard, which would just redirect to /login
          // anyway with no explanation of why.
          router.replace("/login?error=NoAccount");
        }
      })
      .catch(() => router.replace("/login?error=NoAccount"));
  }, [isLoading, isAuthenticated, ensureLinked, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-void">
      <p className="font-mono text-sm uppercase tracking-wider text-smoke">
        Finishing sign-in…
      </p>
    </div>
  );
}
