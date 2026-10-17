import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";
import type { FocusArea } from "@/models/types/operation";
import { ALLIED_GROUPS } from "@/content/allied-groups";

const FOCUS_CARDS: { area: FocusArea; description: string }[] = [
  {
    area: "Mutual Aid",
    description:
      "Direct support — food, supplies, and resources moved to the people who need them, organized locally.",
  },
  {
    area: "Direct Action Support",
    description:
      "Logistics, legal-observer coordination, and backup for ALF, AntiFa, BLM, XR, union organizing drives, and other direct-action groups.",
  },
  {
    area: "Media & Awareness",
    description:
      "An independent media team covering events from an Anarchist and Voluntaryist perspective.",
  },
  {
    area: "Digital Security",
    description:
      "OPSEC training and tooling so organizers and at-risk community members can operate safely.",
  },
  {
    area: "Community Defense",
    description:
      "Building the networks and skills communities need to protect themselves and each other.",
  },
];

export default function MissionPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav />

      <main className="flex-1">
        <section className="border-b border-border/80">
          <div className="mx-auto max-w-3xl px-6 py-16">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-arm-gold">
              Mission
            </p>
            <h1 className="mt-3 text-3xl font-bold text-bone">
              Education Through Anarchist Philosophy
            </h1>
            <p className="mt-6 text-base leading-relaxed text-smoke">
              We are an activist organization within the Anonymous movement
              focused on education through Anarchist philosophy — Mutual Aid,
              Direct Action, Voluntarism, Collectivism, Agorism, and
              Anarcho-Syndicalism. We are a network of members from around
              the globe, supporting direct action groups, worker organizing,
              and Anarchist philosophy in action.
            </p>
            <p className="mt-4 text-base leading-relaxed text-smoke">
              We work to break ties with the systems used to control our
              lives, so communities can become independent of them. We
              advocate non-violent resistance to corruption and tyranny, and
              we support each other in doing it.
            </p>
            <blockquote className="mt-10 border-l-2 border-arm-red pl-6 italic text-bone">
              &ldquo;Civil disobedience becomes a sacred duty when the state
              has become lawless or corrupt. And a citizen who barters with
              such a state shares in its corruption and lawlessness.&rdquo;
              <footer className="mt-2 font-mono text-xs not-italic uppercase tracking-wider text-arm-gold">
                &mdash; Gandhi, &ldquo;Young India&rdquo;
              </footer>
            </blockquote>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-arm-gold">
              What We Do
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FOCUS_CARDS.map((card) => (
                <div
                  key={card.area}
                  className="rounded-sm border border-border bg-surface p-6"
                >
                  <h3 className="font-mono text-sm font-semibold uppercase tracking-wider text-bone">
                    {card.area}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-smoke">
                    {card.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border/80 bg-surface/40">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-arm-gold">
              Who We Work With
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-smoke">
              No one does this alone. We organize alongside local and
              national groups building the same kind of world.
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {ALLIED_GROUPS.map((group) => (
                <div
                  key={group.name}
                  className="rounded-sm border border-border bg-surface p-6"
                >
                  <h3 className="font-mono text-sm font-semibold text-bone">
                    {group.name}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-smoke">
                    {group.description}
                  </p>
                  {group.chapters && (
                    <p className="mt-3 text-xs text-smoke/70">
                      Chapters: {group.chapters.join(", ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
