import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";
import { PresenceMap } from "@/components/presence-map";
// import { SOCIAL_LINKS } from "@/content/social-links"; // re-enable once real accounts exist — see src/content/social-links.ts
import { PRESENCE_CITIES } from "@/content/presence-cities";

export default function ConnectPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav />

      <main className="flex-1">
        <section className="border-b border-border/80">
          <div className="mx-auto max-w-3xl px-6 py-16">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-sp-gold">
              Connect
            </p>
            <h1 className="mt-3 text-3xl font-bold text-bone">Find Us</h1>
            <p className="mt-4 text-base leading-relaxed text-smoke">
              Chapters organize locally and coordinate through the member
              network. Use whichever channel works for you below, and if
              you&apos;re not a member yet, the surest way to connect with a
              chapter near you is to apply to join.
            </p>
          </div>
        </section>

        <section className="border-b border-border/80">
          <div className="mx-auto max-w-4xl px-6 py-14">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-sp-gold">
              On The Ground
            </p>
            <h2 className="mt-2 text-xl font-bold text-bone">Where We&apos;re Active</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-smoke">
              Chapters are active in the cities below. We don&apos;t post exact
              meeting spots or schedules publicly — apply to join and we&apos;ll
              connect you with the chapter nearest you.
            </p>

            <div className="mt-6">
              <PresenceMap />
            </div>

            <ul className="mt-6 flex flex-wrap gap-2">
              {PRESENCE_CITIES.map((city) => (
                <li
                  key={`${city.name}-${city.state}`}
                  className="rounded-full border border-border bg-surface px-3 py-1 font-mono text-xs text-bone"
                >
                  {city.name}, {city.state}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* No social media presence yet — re-enable once real accounts
            exist (see src/content/social-links.ts).
        <section>
          <div className="mx-auto max-w-3xl px-6 py-14">
            <ul className="divide-y divide-border rounded-sm border border-border bg-surface">
              {SOCIAL_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-6 py-4 text-sm text-bone transition-colors hover:bg-surface-2"
                  >
                    <span>{link.label}</span>
                    <span className="font-mono text-xs text-smoke">{link.href}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
        */}
      </main>

      <PublicFooter />
    </div>
  );
}
