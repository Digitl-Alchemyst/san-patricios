import Image from "next/image";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";
import type { FocusArea } from "@/models/types/operation";
import { ALLIED_GROUPS } from "@/content/allied-groups";

const FOCUS_CARDS: { area: FocusArea; description: string }[] = [
  {
    area: "Mutual Aid",
    description:
      "Food drives, supply distribution, and resources moved directly to the people who need them — organized locally, chapter by chapter.",
  },
  {
    area: "Community for Self Defense",
    description:
      "Know-your-rights training, cop-watch patrols, and de-escalation and self-defense classes, so communities can look out for each other without waiting on anyone else.",
  },
  {
    area: "Cultural Education",
    description:
      "Decolonized history and language programs for members and the community — reviving Irish, Spanish, and Indigenous languages, and teaching the real history of the Batallón de San Patricio on our own terms.",
  },
  {
    area: "Anti-Racism & Solidarity",
    description:
      "Organizing against the racism, nativism, and anti-immigrant policy that the original San Patricios faced — and that Irish, Mexican, and Indigenous communities still face today.",
  },
  {
    area: "Direct Action Support",
    description:
      "Logistics, turnout, and legal-observer coordination backing tenant organizing, labor drives, and immigrant-rights actions.",
  },
  {
    area: "Decolonization",
    description:
      "Organizing in solidarity with Indigenous land and water defense, Irish anti-colonial struggle, and other movements confronting occupation and colonialism directly — including Free Palestine.",
  },
];

export default function MissionPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav />

      <main className="flex-1">
        <section className="border-b border-border/80">
          <div className="mx-auto max-w-3xl px-6 py-16">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-sp-gold">
              Mission
            </p>
            <h1 className="mt-3 text-3xl font-bold text-bone">
              Serve, Observe, and Protect
            </h1>
            <p className="mt-6 text-base leading-relaxed text-smoke">
              San Patricios is a community of Irish, Mexican, and Indigenous
              people and allies, united the way the original Batallón de San
              Patricio was in 1847 — by the belief that these communities&apos;
              fights are the same fight. We carry their name forward as a
              living organization, not a memorial: a network of chapters doing
              mutual aid, community-oriented self-defense, and cultural
              education work on the ground. Central to that work is
              decolonized education and the revival of native languages —
              Irish, Spanish, and Indigenous languages our communities were
              punished for speaking, taught again on our own terms.
            </p>
            <p className="mt-4 text-base leading-relaxed text-smoke">
              Our programs are modeled on the original Black Panther Party&apos;s
              &ldquo;survival pending revolution&rdquo; approach and grow out
              of the Brown Beret tradition of community defense and youth
              organizing — see{" "}
              <a href="/history" className="text-sp-gold hover:underline">
                our history
              </a>{" "}
              for how those threads connect. We organize against the same
              nativism and anti-immigrant hostility the original San Patricios
              deserted an army over, in solidarity with Black Lives Matter,
              Indigenous land and water defenders, and every community doing
              this work alongside us. Black organizers and allies are welcome
              in San Patricios too — and where our own chapters aren&apos;t
              the right fit, we&apos;ll connect you directly with the Black
              Panther-descended and -inspired organizations we work beside.
            </p>
            <blockquote className="mt-10 border-l-2 border-sp-green pl-6 italic text-bone">
              &ldquo;We serve the people who raised us, defend the communities
              who need us, and remember the ones who came before us.&rdquo;
              <footer className="mt-2 font-mono text-xs not-italic uppercase tracking-wider text-sp-gold">
                &mdash; The San Patricios Creed
              </footer>
            </blockquote>
          </div>
        </section>

        <section className="border-b border-border/80 bg-surface/40">
          <div className="mx-auto max-w-3xl px-6 py-10">
            <Image
              src="/775.png"
              alt="San Patricios brand mark and program overview"
              width={2500}
              height={2968}
              sizes="(min-width: 768px) 48rem, 100vw"
              className="h-auto w-full"
            />
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-sp-gold">
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
            <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-sp-gold">
              Movements We Stand With
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-smoke">
              No one does this alone. These are the traditions we come from
              and the movements we stand beside.
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
