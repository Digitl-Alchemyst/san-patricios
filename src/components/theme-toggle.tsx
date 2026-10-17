"use client";

import { useLayoutEffect } from "react";

const STORAGE_KEY = "sp-theme";

function getStoredTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function ThemeToggle() {
  // React's dev Strict Mode remounts once and clears attributes the inline
  // script (src/app/layout.tsx) set that aren't in the JSX
  // (<html data-theme="light">). Re-apply here — a DOM write only, no React
  // state — so this can't hydration-mismatch and doesn't trip the
  // no-setstate-in-effect lint rule. No-op in production.
  //
  // The icon itself is never driven by React state (see .theme-icon-sun/
  // .theme-icon-moon in globals.css, toggled purely by the [data-theme]
  // attribute) — both icons render identically on server and client, so
  // there's nothing for hydration to mismatch on.
  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-theme", getStoredTheme());
  }, []);

  function toggle() {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const next = isDark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore (private browsing, storage disabled, etc.)
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-border text-smoke transition-colors hover:border-sp-green hover:text-bone"
    >
      <span className="theme-icon-sun">
        <SunIcon />
      </span>
      <span className="theme-icon-moon">
        <MoonIcon />
      </span>
    </button>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
