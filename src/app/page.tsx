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
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-arm-gold">
                An Anarchist Sector of Anonymous
              </p>
              <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-bone sm:text-5xl">
                Anonymous <span className="text-arm-red">Resistance</span> Movement
              </h1>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-smoke">
                A global collective of Anarchist Anonymous members organizing
                mutual aid, direct action support, and independent media.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/mission"
                  className="rounded-sm border border-arm-red bg-arm-red px-6 py-3 font-mono text-sm font-semibold uppercase tracking-wider text-bone transition-colors hover:bg-arm-red-glow hover:border-arm-red-glow"
                >
                  Read Our Mission
                </Link>
                <Link
                  href="/join"
                  className="rounded-sm border border-border px-6 py-3 font-mono text-sm font-semibold uppercase tracking-wider text-bone transition-colors hover:border-arm-gold hover:text-arm-gold"
                >
                  Request to Join
                </Link>
              </div>
            </div>

            <div className="relative mx-auto aspect-square w-full max-w-md">
              <Image
                src="/Anon Resist-Fist.png"
                alt="ARM seal: a raised fist over a globe, wreathed in laurel"
                fill
                priority
                className="object-contain"
              />
            </div>
          </div>
        </section>

        <section className="border-b border-border/80 bg-surface/40">
          <div className="mx-auto grid max-w-6xl gap-6 px-6 py-16 sm:grid-cols-3">
            <LandingCard
              href="/mission"
              title="Mission"
              body="Who we are, what we believe, and why we organize."
            />
            <LandingCard
              href="/operations"
              title="Operations"
              body="Campaigns the movement is currently running or supporting."
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
      className="block rounded-sm border border-border bg-surface p-6 transition-colors hover:border-arm-red/60"
    >
      <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-bone">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-smoke">{body}</p>
    </Link>
  );
}
