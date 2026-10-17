import Link from "next/link";
import { PublicNav } from "@/components/public-nav";
import { JoinForm } from "@/components/join-form";

export default function JoinPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav />

      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-bone">Membership Application</h1>
            <p className="mt-2 text-sm text-smoke">
              Vetting is manual and handled by existing members. Nothing you
              submit here is public, and you don&apos;t need to give a real
              name — just a secure way to reach you.
            </p>
          </div>

          <JoinForm />

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
