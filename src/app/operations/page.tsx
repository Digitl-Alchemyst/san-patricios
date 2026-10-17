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
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-sp-gold">
              Programs
            </p>
            <h1 className="mt-3 text-3xl font-bold text-bone">
              Our Community Programs
            </h1>
            <p className="mt-4 text-base leading-relaxed text-smoke">
              Below are the programs San Patricios chapters run. Day-to-day
              coordination, scheduling, and internal communication for these
              and other operations happen inside the member network. We don&apos;t
              link out to third-party social accounts here — verify any
              account claiming to speak for a program through the member
              network first.
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
                    <p className="mt-3 rounded-sm border border-sp-red/60 bg-sp-red-dim/20 px-3 py-2 text-xs leading-relaxed text-bone">
                      <span className="font-mono uppercase tracking-wider text-sp-red">
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
                Want to help run a program, not just read about one?
              </p>
              <Link
                href="/join"
                className="mt-4 inline-block rounded-sm border border-sp-green bg-sp-green px-6 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-on-brand transition-colors hover:bg-sp-green-glow hover:border-sp-green-glow"
              >
                Apply to Join
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
