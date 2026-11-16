"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/navigation";
import { isActive } from "./Nav";
import { LanguageSwitcher } from "./LanguageSwitcher";
import type { Locale } from "@/i18n/config";

interface MobileNavProps {
  items: NavItem[];
  locale: Locale;
  labels: { menu: string; close: string; primary: string; language: string };
  className?: string;
}

/**
 * Mobile navigation trigger + panel. Full-screen editorial panel (large
 * display-serif links, mono chrome) rather than a generic hamburger
 * dropdown. Handles: aria-expanded/aria-controls on the trigger,
 * Escape-to-close with focus return, a basic Tab focus trap while open
 * (role="dialog" aria-modal="true" requires one), and body scroll lock.
 */
export function MobileNav({ items, locale, labels, className = "" }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }

      if (event.key === "Tab" && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className={`lg:hidden ${className}`.trim()}>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? labels.close : labels.menu}
        onClick={() => setOpen((v) => !v)}
        className="font-mono text-ui-sm tracking-mono uppercase text-ink px-2 py-2 hover:text-accent transition-colors duration-[175ms] ease-editorial"
      >
        {open ? labels.close : labels.menu}
      </button>

      {open && (
        <div
          id={panelId}
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={labels.primary}
          className="fixed inset-0 z-50 flex flex-col bg-surface"
        >
          <div className="flex h-16 items-center justify-between px-5">
            <span className="font-mono text-ui-sm tracking-mono uppercase text-ink-muted">
              {labels.menu}
            </span>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setOpen(false)}
              className="font-mono text-ui-sm tracking-mono uppercase text-ink-muted hover:text-ink"
            >
              {labels.close}
            </button>
          </div>

          <nav aria-label={labels.primary} className="flex-1 overflow-y-auto px-5 py-8">
            <ul className="flex flex-col gap-6">
              {items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setOpen(false)}
                      className={`font-display text-h3 ${
                        active ? "text-accent" : "text-ink"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="border-t border-border px-5 py-6">
            <LanguageSwitcher current={locale} label={labels.language} />
          </div>
        </div>
      )}
    </div>
  );
}
