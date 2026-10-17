import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_LINKS = [
  { href: "/history", label: "History" },
  { href: "/mission", label: "Mission" },
  { href: "/operations", label: "Programs" },
  { href: "/connect", label: "Connect" },
];

export function PublicNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-void/85 backdrop-blur">
      <div
        aria-hidden
        className="h-[5px] w-full"
        style={{
          background:
            "linear-gradient(to right, #0f7a45 0 16.66%, #fbf8f2 16.66% 33.33%, #c1570a 33.33% 50%, #0f7a45 50% 66.66%, #fbf8f2 66.66% 83.33%, #ce1126 83.33% 100%)",
        }}
      />
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/Batallon-de-San-Patricio-SEAL-1847-CD.jpg"
            alt="Seal of the Batallón de San Patricio, 1847"
            width={40}
            height={40}
            className="rounded-full"
            priority
          />
          <span className="font-mono text-sm font-semibold tracking-widest text-bone uppercase">
            San Patricios
          </span>
        </Link>

        <nav className="hidden items-center gap-6 font-mono text-xs uppercase tracking-wider text-smoke sm:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-bone">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="font-mono text-xs uppercase tracking-wider text-smoke transition-colors hover:text-bone"
          >
            Member Login
          </Link>
          <Link
            href="/join"
            className="rounded-sm border border-sp-green bg-sp-green-dim/40 px-4 py-2 font-mono text-xs uppercase tracking-wider text-bone transition-colors hover:bg-sp-green/80"
          >
            Apply to Join
          </Link>
        </div>
      </div>
    </header>
  );
}
