import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // Next's dev-only "Instant Navigation" validation probes every route by
    // default, including "use client" pages, by rendering them in a special
    // validation pass. Convex's WebSocket-based client (ConvexReactClient,
    // required module-scope per Convex's own docs) doesn't survive that
    // probe cleanly and throws inside ConvexProvider — a dev-overlay-only
    // issue, not a real bug: `pnpm build`/`next start` are unaffected,
    // since that's a separate, stricter build-time check this doesn't
    // touch (the one `export const instant = false` on src/app/app/layout.tsx
    // and src/app/signup/[token]/page.tsx already satisfies). Scoping
    // validation to explicit opt-ins only (none of our routes opt in)
    // silences the noise without weakening that real safety net. See
    // docs/ARCHITECTURE.md.
    instantInsights: {
      validationLevel: "manual-warning",
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
