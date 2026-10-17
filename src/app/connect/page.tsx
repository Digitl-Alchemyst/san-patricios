import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";
import { PresenceMap } from "@/components/presence-map";
import { SOCIAL_LINKS } from "@/content/social-links";
import { PRESENCE_CITIES } from "@/content/presence-cities";

export default function ConnectPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav />

      <main className="flex-1">
        <section className="border-b border-border/80">
          <div className="mx-auto max-w-3xl px-6 py-16">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-arm-gold">
              Connect
            </p>
            <h1 className="mt-3 text-3xl font-bold text-bone">Find Us</h1>
            <p className="mt-4 text-base leading-relaxed text-smoke">
              There&apos;s no central leadership here, so the network gathers
              in several places. Use whichever channel works for you, and
              bring your own operational security.
            </p>
          </div>
        </section>

        <section className="border-b border-border/80">
          <div className="mx-auto max-w-4xl px-6 py-14">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-arm-gold">
              On The Ground
            </p>
            <h2 className="mt-2 text-xl font-bold text-bone">Where We&apos;re Active</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-smoke">
              Local crews are active in the cities below. We don&apos;t post exact
              meeting spots or schedules publicly — reach out through the
              member network to connect with one near you.
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
      </main>

      <PublicFooter />
    </div>
  );
}
