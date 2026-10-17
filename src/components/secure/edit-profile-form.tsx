"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useCurrentMember, useUpdateProfile } from "@/services/members/use-members";
import { MemberAvatar } from "@/components/secure/member-avatar";
import { FOCUS_AREAS, type FocusArea } from "@/models/types/operation";

/** "Label | https://url" per line, matching the one-per-line convention
 * used for operation resources elsewhere in this app. */
function parseSocialLinks(raw: string): { label: string; url: string }[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...rest] = line.split("|");
      return { label: label.trim(), url: rest.join("|").trim() };
    })
    .filter((link) => link.label && link.url);
}

function formatSocialLinks(links?: { label: string; url: string }[]): string {
  return (links ?? []).map((l) => `${l.label} | ${l.url}`).join("\n");
}

export function EditProfileForm() {
  const router = useRouter();
  const member = useCurrentMember();
  const updateProfile = useUpdateProfile();

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);
  const [focusAreas, setFocusAreas] = useState<FocusArea[] | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined);

  // Lazily seed local state from the loaded member the first time it
  // arrives, without re-stomping edits in progress on every re-render.
  if (member && focusAreas === null) {
    setFocusAreas(member.focusAreas);
    setAvatarPreview(member.avatarUrl);
  }

  function toggleFocusArea(area: FocusArea) {
    setFocusAreas((prev) => {
      const current = prev ?? [];
      return current.includes(area)
        ? current.filter((a) => a !== area)
        : [...current, area];
    });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const handle = String(formData.get("handle") ?? "").trim();
    const username = String(formData.get("username") ?? "").trim();
    const bio = String(formData.get("bio") ?? "").trim();
    const avatarUrl = String(formData.get("avatarUrl") ?? "").trim();
    const socialLinksRaw = String(formData.get("socialLinks") ?? "");

    if (!handle) {
      setError("Handle is required.");
      return;
    }

    setPending(true);
    try {
      await updateProfile({
        handle,
        username: username || undefined,
        bio: bio || undefined,
        avatarUrl: avatarUrl || undefined,
        focusAreas: focusAreas ?? [],
        socialLinks: parseSocialLinks(socialLinksRaw),
      });
      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  if (member === undefined) {
    return <p className="text-sm text-smoke">Loading…</p>;
  }

  if (member === null) {
    return (
      <p className="rounded-sm border border-sp-red/60 bg-sp-red-dim/30 px-4 py-3 text-sm text-bone">
        No linked member account found.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center gap-4">
        <MemberAvatar handle={member.handle} avatarUrl={avatarPreview} size={56} />
        <div className="flex-1">
          <label htmlFor="avatarUrl" className="block font-mono text-xs uppercase tracking-wider text-smoke">
            Avatar URL <span className="normal-case text-smoke/60">(optional)</span>
          </label>
          <input
            id="avatarUrl"
            name="avatarUrl"
            defaultValue={member.avatarUrl ?? ""}
            onChange={(e) => setAvatarPreview(e.target.value || undefined)}
            placeholder="https://…"
            className="mt-2 w-full rounded-sm border border-border bg-void px-4 py-3 text-sm text-bone placeholder:text-smoke/50 focus:border-sp-green focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label htmlFor="handle" className="block font-mono text-xs uppercase tracking-wider text-smoke">
          Handle
        </label>
        <input
          id="handle"
          name="handle"
          defaultValue={member.handle}
          className="mt-2 w-full rounded-sm border border-border bg-void px-4 py-3 text-sm text-bone focus:border-sp-green focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="username" className="block font-mono text-xs uppercase tracking-wider text-smoke">
          Username <span className="normal-case text-smoke/60">(optional, slug-style)</span>
        </label>
        <input
          id="username"
          name="username"
          defaultValue={member.username ?? ""}
          placeholder="first_last"
          className="mt-2 w-full rounded-sm border border-border bg-void px-4 py-3 text-sm text-bone placeholder:text-smoke/50 focus:border-sp-green focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="bio" className="block font-mono text-xs uppercase tracking-wider text-smoke">
          Bio <span className="normal-case text-smoke/60">(optional)</span>
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          defaultValue={member.bio ?? ""}
          placeholder="A line or two about you"
          className="mt-2 w-full rounded-sm border border-border bg-void px-4 py-3 text-sm text-bone placeholder:text-smoke/50 focus:border-sp-green focus:outline-none"
        />
      </div>

      <div>
        <p className="font-mono text-xs uppercase tracking-wider text-smoke">
          Focus Areas
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {FOCUS_AREAS.map((area) => {
            const active = (focusAreas ?? []).includes(area);
            return (
              <button
                key={area}
                type="button"
                onClick={() => toggleFocusArea(area)}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  active
                    ? "border-sp-green bg-sp-green-dim/40 text-bone"
                    : "border-border text-smoke hover:border-sp-green/60 hover:text-bone"
                }`}
              >
                {area}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label htmlFor="socialLinks" className="block font-mono text-xs uppercase tracking-wider text-smoke">
          Social Links <span className="normal-case text-smoke/60">(one per line: Label | URL)</span>
        </label>
        <textarea
          id="socialLinks"
          name="socialLinks"
          rows={3}
          defaultValue={formatSocialLinks(member.socialLinks)}
          placeholder={"Instagram | https://instagram.com/…"}
          className="mt-2 w-full rounded-sm border border-border bg-void px-4 py-3 text-sm text-bone placeholder:text-smoke/50 focus:border-sp-green focus:outline-none"
        />
      </div>

      {error && (
        <p className="rounded-sm border border-sp-red/60 bg-sp-red-dim/30 px-3 py-2 text-sm text-bone">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-sm border border-sp-green/60 bg-sp-green-dim/40 px-3 py-2 text-sm text-bone">
          Profile updated.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-sm border border-sp-green bg-sp-green px-6 py-3 font-mono text-sm font-semibold uppercase tracking-wider text-on-brand transition-colors hover:bg-sp-green-glow hover:border-sp-green-glow disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Saving…" : "Save Profile"}
      </button>
    </form>
  );
}
