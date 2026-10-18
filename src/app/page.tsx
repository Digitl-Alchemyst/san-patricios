import Image from "next/image";
import Link from "next/link";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav />

      <main className="flex-1">
        <section className="border-b border-border/80">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-sp-gold">
                Erin go Bragh &middot; Viva la Raza &middot; Est. 1847 &middot; Reborn Today
              </p>
              <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-bone sm:text-5xl">
                San <span className="text-sp-green">Patricios</span>
              </h1>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-smoke">
                A community of Irish, Mexican, and Indigenous people and allies,
                carrying forward the name of the Batallón de San Patricio.
                We organize mutual aid, community defense, and cultural
                education &mdash; serve, observe, and protect.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/history"
                  className="rounded-sm border border-sp-green bg-sp-green px-6 py-3 font-mono text-sm font-semibold uppercase tracking-wider text-on-brand transition-colors hover:bg-sp-green-glow hover:border-sp-green-glow"
                >
                  Our History
                </Link>
                <Link
                  href="/join"
                  className="rounded-sm border border-border px-6 py-3 font-mono text-sm font-semibold uppercase tracking-wider text-bone transition-colors hover:border-sp-gold hover:text-sp-gold"
                >
                  Apply to Join
                </Link>
              </div>
            </div>

            <div className="relative mx-auto aspect-[2/1] w-full max-w-lg overflow-hidden rounded-sm border border-border">
              <Image
                src="/Erin_Go_Bragh_Banner.svg"
                alt="Erin go Bragh banner"
                fill
                priority
                className="object-cover"
              />
            </div>
          </div>
        </section>

        <section className="border-b border-border/80 bg-surface/40">
          <div className="mx-auto grid max-w-6xl gap-6 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
            <LandingCard
              href="/history"
              title="History"
              body="The story of the original San Patricios, and why we carry their name forward."
            />
            <LandingCard
              href="/mission"
              title="Mission"
              body="Who we are, what we believe, and how we organize."
            />
            <LandingCard
              href="/operations"
              title="Programs"
              body="Mutual aid, community defense, and cultural education programs we run."
            />
            <LandingCard
              href="/connect"
              title="Connect"
              body="Where to find us, and how to reach us securely."
            />
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

function LandingCard({
  href,
  title,
  body,
}: {
  href: string;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-sm border border-border bg-surface p-6 transition-colors hover:border-sp-green/60"
    >
      <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-bone">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-smoke">{body}</p>
    </Link>
  );
}
