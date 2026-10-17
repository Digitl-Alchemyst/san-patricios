import Link from "next/link";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";
import { PUBLIC_CAMPAIGNS } from "@/content/public-campaigns";

export default function PublicOperationsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav />

      <main className="flex-1">
        <section className="border-b border-border/80">
          <div className="mx-auto max-w-3xl px-6 py-16">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-arm-gold">
              Operations
            </p>
            <h1 className="mt-3 text-3xl font-bold text-bone">
              Campaigns We Support
            </h1>
            <p className="mt-4 text-base leading-relaxed text-smoke">
              Below are public campaigns the movement backs. Day-to-day
              coordination, scheduling, and internal communication for these
              and other operations happen inside the member network. We don&apos;t
              link out to third-party social accounts here — campaign pages
              have been compromised before, so verify any account claiming to
              speak for an operation through the member network first.
            </p>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-4xl px-6 py-14">
            <div className="space-y-4">
              {PUBLIC_CAMPAIGNS.map((campaign) => (
                <div
                  key={campaign.codename}
                  className="rounded-sm border border-border bg-surface p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="font-mono text-base font-semibold text-bone">
                      {campaign.codename}
                    </h2>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-smoke">
                      {campaign.focusArea}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-smoke">
                    {campaign.summary}
                  </p>
                  {campaign.warning && (
                    <p className="mt-3 rounded-sm border border-arm-red/60 bg-arm-red-dim/20 px-3 py-2 text-xs leading-relaxed text-bone">
                      <span className="font-mono uppercase tracking-wider text-arm-red-glow">
                        Warning:
                      </span>{" "}
                      {campaign.warning}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-12 rounded-sm border border-border bg-surface/60 p-6 text-center">
              <p className="text-sm text-smoke">
                Want to help organize an operation, not just watch one?
              </p>
              <Link
                href="/join"
                className="mt-4 inline-block rounded-sm border border-arm-red bg-arm-red px-6 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-bone transition-colors hover:bg-arm-red-glow hover:border-arm-red-glow"
              >
                Request to Join
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
