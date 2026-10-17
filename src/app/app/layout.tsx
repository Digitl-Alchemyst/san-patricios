import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "@convex/_generated/api";
import { auth, signOut } from "@/lib/auth/config";
import { mintConvexToken } from "@/server/actions/convex-token";
import { SidebarNav } from "@/components/secure/sidebar-nav";

// Cache Components (`cacheComponents: true` in next.config.ts) requires a
// request-time cookie/session read to sit behind `"use cache: private"` or
// a <Suspense> boundary. This whole area reads the NextAuth session plus a
// live Convex lookup, so it opts out of instant-navigation validation
// rather than adding that machinery for a single server-side check. See
// docs/ARCHITECTURE.md.
export const instant = false;

async function logout() {
  "use server";
  await signOut({ redirectTo: "/login" });
}

export default async function SecureLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  // Having a Google session only proves "verified Google account" — real
  // authorization is a Convex members row, created only through the
  // invite-token flow (or pre-seeded, then linked by members.ensureLinked).
  const token = await mintConvexToken();
  const member = token ? await fetchQuery(api.members.current, {}, { token }) : null;

  if (!member || member.status !== "active" || member.tier === "pending") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-surface/60 px-4 py-6">
        <Link href="/app/dashboard" className="mb-8 flex items-center gap-3 px-2">
          <Image src="/ARM Logo.png" alt="ARM seal" width={32} height={32} />
          <span className="font-mono text-sm font-semibold uppercase tracking-widest text-bone">
            Resistance HQ
          </span>
        </Link>

        <SidebarNav />

        <div className="mt-auto flex flex-col gap-3 border-t border-border pt-4">
          <div className="px-2">
            <p className="font-mono text-xs uppercase tracking-wider text-smoke">
              Signed in as
            </p>
            <p className="truncate text-sm font-medium text-bone">{member.handle}</p>
            <p className="truncate text-xs text-smoke">{member.tier}</p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="w-full rounded-sm border border-border px-3 py-2 font-mono text-xs uppercase tracking-wider text-smoke transition-colors hover:border-arm-red hover:text-bone"
            >
              Log Out
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-8 py-10">{children}</div>
      </main>
    </div>
  );
}
