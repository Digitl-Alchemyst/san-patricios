"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

function formatRetryAfter(seconds: number): string {
  const minutes = Math.ceil(seconds / 60);
  return minutes <= 1 ? "a minute" : `${minutes} minutes`;
}

// NextAuth's own built-in codes, plus "NoAccount" — our own, set by
// src/app/auth/complete/page.tsx when Google sign-in succeeds but no
// Convex member matches. "Configuration"/anything else covers a real,
// reproduced oauth4webapi/Google interaction bug (see
// src/lib/auth/config.ts) — not something retrying with the *same* account
// will necessarily avoid, so that message says so rather than implying
// it's the user's fault.
const URL_ERROR_MESSAGES: Record<string, string> = {
  NoAccount:
    "That Google account isn't linked to a member here. If you were invited, use your invite link instead — or sign in with email/password.",
  AccessDenied: "Sign-in was cancelled or denied.",
  OAuthAccountNotLinked:
    "That Google account isn't linked to a member here. If you were invited, use your invite link instead.",
  Configuration:
    "Google sign-in hit a temporary error on its end. Try again, or use email/password instead.",
};
const DEFAULT_URL_ERROR_MESSAGE =
  "Something went wrong signing in. Try again, or use email/password instead.";

export function LoginForm() {
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  // Set only after a failed attempt, to check whether it was specifically a
  // lockout — see convex/loginAttempts.ts's `status` query doc comment for
  // why this is safe to check without revealing account existence.
  const [checkEmail, setCheckEmail] = useState<string | null>(null);
  const lockStatus = useQuery(api.loginAttempts.status, checkEmail ? { email: checkEmail } : "skip");

  async function handlePasswordSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setCheckEmail(null);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }

    setPending(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setPending(false);

    if (result?.error) {
      setCheckEmail(email);
      setError("Incorrect email or password.");
      return;
    }
    window.location.href = "/app/dashboard";
  }

  const displayError =
    lockStatus?.locked && lockStatus.retryAfterSeconds
      ? `Too many attempts. Try again in ${formatRetryAfter(lockStatus.retryAfterSeconds)}.`
      : error;

  return (
    <div className="space-y-6">
      {urlError && (
        <p className="rounded-sm border border-sp-red/60 bg-sp-red-dim/30 px-3 py-2 text-sm text-bone">
          {URL_ERROR_MESSAGES[urlError] ?? DEFAULT_URL_ERROR_MESSAGE}
        </p>
      )}

      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/auth/complete" })}
        className="flex w-full items-center justify-center gap-3 rounded-sm border border-sp-green bg-sp-green px-6 py-3 font-mono text-sm font-semibold uppercase tracking-wider text-on-brand transition-colors hover:bg-sp-green-glow hover:border-sp-green-glow"
      >
        Sign in with Google
      </button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="font-mono text-xs uppercase tracking-wider text-smoke">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handlePasswordSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block font-mono text-xs uppercase tracking-wider text-smoke">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            className="mt-2 w-full rounded-sm border border-border bg-void px-4 py-3 text-sm text-bone focus:border-sp-green focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="password" className="block font-mono text-xs uppercase tracking-wider text-smoke">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            className="mt-2 w-full rounded-sm border border-border bg-void px-4 py-3 text-sm text-bone focus:border-sp-green focus:outline-none"
          />
        </div>

        {displayError && (
          <p className="rounded-sm border border-sp-red/60 bg-sp-red-dim/30 px-3 py-2 text-sm text-bone">
            {displayError}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-sm border border-border px-6 py-3 font-mono text-sm font-semibold uppercase tracking-wider text-bone transition-colors hover:border-sp-green disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in with Email"}
        </button>
      </form>
    </div>
  );
}
