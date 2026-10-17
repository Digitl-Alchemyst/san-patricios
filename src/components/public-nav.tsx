import Image from "next/image";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/mission", label: "Mission" },
  { href: "/operations", label: "Operations" },
  { href: "/connect", label: "Connect" },
];

export function PublicNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-void/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/ARM Logo.png"
            alt="ARM circle-A seal"
            width={40}
            height={40}
            className="rounded"
            priority
          />
          <span className="font-mono text-sm font-semibold tracking-widest text-bone uppercase">
            Anon Resistance
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
          <Link
            href="/login"
            className="font-mono text-xs uppercase tracking-wider text-smoke transition-colors hover:text-bone"
          >
            Member Login
          </Link>
          <Link
            href="/join"
            className="rounded-sm border border-arm-red bg-arm-red-dim/40 px-4 py-2 font-mono text-xs uppercase tracking-wider text-bone transition-colors hover:bg-arm-red/80"
          >
            Request to Join
          </Link>
        </div>
      </div>
    </header>
  );
}
