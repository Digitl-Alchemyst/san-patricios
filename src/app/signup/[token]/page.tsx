import { PublicNav } from "@/components/public-nav";
import { SignupTokenView } from "@/components/signup-token-view";

// This route only ever makes sense per-visit (a specific invite token, live
// Convex/auth state) — never part of the static shell. See docs/ARCHITECTURE.md.
export const instant = false;

export default async function SignupTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav />

      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm text-center">
          <SignupTokenView token={token} />
        </div>
      </main>
    </div>
  );
}
