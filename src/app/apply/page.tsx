import Link from "next/link";
import { PublicNav } from "@/components/public-nav";
import { DirectApplyForm } from "@/components/direct-apply-form";

/**
 * Unlisted on purpose — not linked from PublicNav, the footer, or anywhere
 * else on the site. A member shares this URL directly with someone they
 * already know and have vetted in person, as a shorter alternative to the
 * full public /join application. Lands in the same coordinator review
 * queue (/app/join-requests), tagged "direct" there.
 */
export default function ApplyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav />

      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-bone">Request an Account</h1>
            <p className="mt-2 text-sm text-smoke">
              For people a member already knows and has vouched for in
              person. A coordinator still reviews every request before
              approving it.
            </p>
          </div>

          <DirectApplyForm />

          <p className="mt-6 text-center text-sm text-smoke">
            Already a member?{" "}
            <Link href="/login" className="text-sp-gold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
