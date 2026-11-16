"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/navigation";

interface NavProps {
  items: NavItem[];
  label: string;
  className?: string;
}

/** True when `pathname` is the item's page or a page below it. */
export function isActive(pathname: string | null, itemHref: string) {
  if (!pathname) return false;
  const p = pathname.endsWith("/") ? pathname : `${pathname}/`;
  return p === itemHref || p.startsWith(itemHref);
}

/**
 * Primary desktop navigation in the mono/citation layer. Active state
 * uses the accent colour, not weight or decoration alone.
 */
export function Nav({ items, label, className = "" }: NavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label={label} className={className}>
      <ul className="flex items-center gap-8">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
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
