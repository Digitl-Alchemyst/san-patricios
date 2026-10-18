"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

/**
 * This page has exactly one job: set a one-time password for a newly
 * approved account. Google sign-in is offered only as an explicit
 * "skip this" alternative for people who'd rather not have a password at
 * all — not a second, equally-weighted form next to it.
 */
export function SignupTokenView({ token }: { token: string }) {
  const router = useRouter();
  const { status } = useSession();
  const invite = useQuery(api.inviteTokens.preview, { token });
  const consume = useMutation(api.inviteTokens.consume);
  const consumeWithPassword = useAction(api.auth.consumeInviteWithPassword);

  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);

  async function handleGoogleAccept() {
    setError(null);
    setAccepting(true);
    try {
      await consume({ token });
      router.push("/app/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setAccepting(false);
    }
  }

  async function handlePasswordAccept(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? (invite?.presetEmail ?? "")).trim();
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (!email || !password) {
      setError("Enter an email and password.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setAccepting(true);
    try {
      await consumeWithPassword({ token, email, password });
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        // Account was created, but auto sign-in failed for some reason — send
        // them to log in manually instead of leaving them stuck here.
        router.push("/login");
        return;
      }
      router.push("/app/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setAccepting(false);
    }
  }

  if (invite === undefined) {
    return <p className="text-sm text-smoke">Loading…</p>;
  }

  if (invite === null) {
    return (
      <>
        <h1 className="text-2xl font-bold text-bone">Invalid Invite</h1>
        <p className="mt-3 text-sm text-smoke">
          This invite link is invalid, already used, or has expired. Ask a
          coordinator for a new one.
        </p>
      </>
    );
  }

  if (status === "authenticated") {
    return (
      <>
        <h1 className="text-2xl font-bold text-bone">Welcome, {invite.presetHandle}</h1>
        <p className="mt-3 text-sm text-smoke">
          You&apos;re signed in with Google already — accept the invite to
          finish setting up your {invite.presetTier} account.
        </p>
        {error && (
          <p className="mt-4 rounded-sm border border-sp-red/60 bg-sp-red-dim/30 px-3 py-2 text-sm text-bone">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={handleGoogleAccept}
          disabled={accepting}
          className="mt-6 w-full rounded-sm border border-sp-green bg-sp-green px-6 py-3 font-mono text-sm font-semibold uppercase tracking-wider text-on-brand transition-colors hover:bg-sp-green-glow hover:border-sp-green-glow disabled:cursor-not-allowed disabled:opacity-60"
        >
          {accepting ? "Accepting…" : "Accept Invite"}
        </button>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-bone">Welcome, {invite.presetHandle}</h1>
      <p className="mt-3 text-sm text-smoke">
        You&apos;ve been invited to join as a {invite.presetTier}. Set a
        one-time password below — you&apos;ll use it to log in going
        forward.
      </p>

      {error && (
        <p className="mt-4 rounded-sm border border-sp-red/60 bg-sp-red-dim/30 px-3 py-2 text-sm text-bone">
          {error}
        </p>
      )}

      <form onSubmit={handlePasswordAccept} className="mt-6 space-y-4 text-left">
        <div>
          <label htmlFor="email" className="block font-mono text-xs uppercase tracking-wider text-smoke">
            Email
          </label>
          {invite.presetEmail ? (
            <>
              <input type="hidden" name="email" value={invite.presetEmail} />
              <p className="mt-2 w-full rounded-sm border border-border bg-surface px-4 py-3 font-mono text-sm text-bone">
                {invite.presetEmail}
              </p>
              <p className="mt-1 text-xs text-smoke/60">
                This invite was issued for this address — it can&apos;t be
                changed here.
              </p>
            </>
          ) : (
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              className="mt-2 w-full rounded-sm border border-border bg-void px-4 py-3 text-sm text-bone focus:border-sp-green focus:outline-none"
            />
          )}
        </div>
        <div>
          <label htmlFor="password" className="block font-mono text-xs uppercase tracking-wider text-smoke">
            Password <span className="normal-case text-smoke/60">(min. 8 characters)</span>
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            className="mt-2 w-full rounded-sm border border-border bg-void px-4 py-3 text-sm text-bone focus:border-sp-green focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block font-mono text-xs uppercase tracking-wider text-smoke">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            className="mt-2 w-full rounded-sm border border-border bg-void px-4 py-3 text-sm text-bone focus:border-sp-green focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={accepting}
          className="w-full rounded-sm border border-sp-green bg-sp-green px-6 py-3 font-mono text-sm font-semibold uppercase tracking-wider text-on-brand transition-colors hover:bg-sp-green-glow hover:border-sp-green-glow disabled:cursor-not-allowed disabled:opacity-60"
        >
          {accepting ? "Setting password…" : "Set Password & Accept"}
        </button>
      </form>

      <div className="mt-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="font-mono text-xs uppercase tracking-wider text-smoke">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <button
        type="button"
        onClick={() => signIn("google")}
        className="mt-6 w-full rounded-sm border border-border px-6 py-3 font-mono text-sm font-semibold uppercase tracking-wider text-bone transition-colors hover:border-sp-green"
      >
        Skip — I&apos;ll Use Google Instead
      </button>
    </>
  );
}
