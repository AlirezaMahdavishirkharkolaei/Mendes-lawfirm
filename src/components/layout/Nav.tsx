"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/navigation";

interface NavProps {
  items: NavItem[];
  className?: string;
}

/**
 * Primary desktop navigation. Uses the mono/citation layer for nav
 * labels per the approved typography system (technical layer, used
 * selectively — not the dominant typeface). Active state uses the
 * accent color, not weight or decoration alone.
 */
export function Nav({ items, className = "" }: NavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className={className}>
      <ul className="flex items-center gap-8">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`font-mono text-ui-sm tracking-mono uppercase transition-colors duration-[175ms] ease-editorial ${
                  active ? "text-accent" : "text-ink-muted hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
