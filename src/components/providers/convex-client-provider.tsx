"use client";

import type { ReactNode } from "react";
import { ConvexProviderWithAuth } from "convex/react";
import { convexClient } from "@/lib/convex/client";
import { useConvexAuthFromNextAuth } from "@/hooks/use-convex-auth-from-next-auth";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProviderWithAuth client={convexClient} useAuth={useConvexAuthFromNextAuth}>
      {children}
    </ConvexProviderWithAuth>
  );
}
