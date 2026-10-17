"use client";

import { useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { mintConvexToken } from "@/server/actions/convex-token";

/**
 * The `useAuth` hook Convex's `ConvexProviderWithAuth` expects (see
 * src/components/providers/convex-client-provider.tsx). `isLoading`/
 * `isAuthenticated` come from NextAuth's client-side session state;
 * `fetchAccessToken` always re-mints via the server action rather than
 * trusting anything client-held, since `mintConvexToken` re-verifies the
 * session server-side anyway.
 */
export function useConvexAuthFromNextAuth() {
  const { status } = useSession();

  const fetchAccessToken = useCallback(async () => {
    if (status !== "authenticated") return null;
    return mintConvexToken();
  }, [status]);

  return useMemo(
    () => ({
      isLoading: status === "loading",
      isAuthenticated: status === "authenticated",
      fetchAccessToken,
    }),
    [status, fetchAccessToken],
  );
}
