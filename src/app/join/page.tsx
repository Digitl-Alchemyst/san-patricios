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
            <h1 className="text-2xl font-bold text-bone">Request to Join</h1>
            <p className="mt-2 text-sm text-smoke">
              Vetting is manual and handled by existing members. Nothing you
              submit here is public.
            </p>
          </div>

          <JoinForm />

          <p className="mt-6 text-center text-sm text-smoke">
            Already in the network?{" "}
            <Link href="/login" className="text-arm-gold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
