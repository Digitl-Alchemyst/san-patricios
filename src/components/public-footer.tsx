import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="border-t border-border/80 bg-surface/60">
      <div
        aria-hidden
        className="h-[5px] w-full"
        style={{
          background:
            "linear-gradient(to right, #0f7a45 0 16.66%, #fbf8f2 16.66% 33.33%, #c1570a 33.33% 50%, #0f7a45 50% 66.66%, #fbf8f2 66.66% 83.33%, #ce1126 83.33% 100%)",
        }}
      />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <nav className="flex flex-wrap gap-5 font-mono text-xs uppercase tracking-wider text-smoke">
            <Link href="/history" className="hover:text-bone">History</Link>
            <Link href="/mission" className="hover:text-bone">Mission</Link>
            <Link href="/operations" className="hover:text-bone">Programs</Link>
            <Link href="/connect" className="hover:text-bone">Connect</Link>
            <Link href="/login" className="hover:text-bone">Member Login</Link>
          </nav>
          <p className="text-xs text-smoke">
            &copy; 2026 San Patricios &mdash; Éirinn go Brách. Viva la Raza.
          </p>
        </div>
      </div>
    </footer>
  );
}
