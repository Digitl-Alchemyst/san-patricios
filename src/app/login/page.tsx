import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { PublicNav } from "@/components/public-nav";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav />

      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center text-center">
            <Image
              src="/ARM Logo.png"
              alt="ARM circle-A seal"
              width={56}
              height={56}
              className="mb-4"
            />
            <h1 className="text-2xl font-bold text-bone">Member Login</h1>
            <p className="mt-2 text-sm text-smoke">
              Sign in with Google, or the email and password tied to your membership.
            </p>
          </div>

          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>

          <p className="mt-6 text-center text-sm text-smoke">
            Not in the network yet?{" "}
            <Link href="/join" className="text-arm-gold hover:underline">
              Request to join
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
