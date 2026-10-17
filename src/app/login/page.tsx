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
              src="/Batallon-de-San-Patricio-SEAL-1847-CD.jpg"
              alt="Seal of the Batallón de San Patricio, 1847"
              width={56}
              height={56}
              className="mb-4 rounded-full"
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
            Not a member yet?{" "}
            <Link href="/join" className="text-sp-gold hover:underline">
              Apply to join
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
