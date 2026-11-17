"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNav({ items }: { items: { href: string; label: string; badge?: number }[] }) {
  const path = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto lg:flex-col">
      {items.map((i) => {
        const active = i.href === "/admin" ? path === "/admin" : path?.startsWith(i.href);
        return (
          <Link key={i.href} href={i.href} className={`flex shrink-0 items-center justify-between gap-3 rounded-[3px] px-4 py-2.5 text-ui transition-colors ${active ? "bg-gold/15 text-gold-light" : "text-ivory/75 hover:bg-night-3 hover:text-ivory"}`}>
            {i.label}
            {!!i.badge && <span className="rounded-full bg-gold px-2 py-0.5 font-mono text-[0.6rem] text-night">{i.badge}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
