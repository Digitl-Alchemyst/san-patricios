import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="border-t border-border/80 bg-surface/60">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <nav className="flex flex-wrap gap-5 font-mono text-xs uppercase tracking-wider text-smoke">
            <Link href="/mission" className="hover:text-bone">Mission</Link>
            <Link href="/operations" className="hover:text-bone">Operations</Link>
            <Link href="/connect" className="hover:text-bone">Connect</Link>
            <Link href="/login" className="hover:text-bone">Member Login</Link>
          </nav>
          <p className="text-xs text-smoke">
            &copy; 2026 Anonymous Resistance Movement
          </p>
        </div>
      </div>
    </footer>
  );
}
