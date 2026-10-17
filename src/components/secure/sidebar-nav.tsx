"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

const NAV_ITEMS = [
  { href: "/app/dashboard", label: "Dashboard" },
  { href: "/app/operations", label: "Operations" },
  { href: "/app/chat", label: "Group Chat" },
  { href: "/app/members", label: "Members" },
];

export function SidebarNav() {
  const pathname = usePathname();
  const member = useQuery(api.members.current);
  const isCoordinatorOrAbove = member?.tier === "coordinator" || member?.tier === "admin";

  const items = isCoordinatorOrAbove
    ? [...NAV_ITEMS, { href: "/app/join-requests", label: "Join Requests" }]
    : NAV_ITEMS;

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-sm px-3 py-2 font-mono text-sm uppercase tracking-wider transition-colors ${
              active
                ? "border border-arm-red/60 bg-arm-red-dim/40 text-bone"
                : "border border-transparent text-smoke hover:border-border hover:text-bone"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
