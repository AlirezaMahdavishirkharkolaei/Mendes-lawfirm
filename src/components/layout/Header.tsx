"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Wordmark } from "./Wordmark";
import { LanguageSwitcher } from "./LanguageSwitcher";

export interface NavItem {
  href: string;
  label: string;
}

export function Header({ locale, items, cta, portal, labels }: { locale: string; items: NavItem[]; cta: NavItem; portal: NavItem; labels: { menu: string; close: string; language: string } }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(window.scrollY > 24);
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu after navigation (derived-state pattern, no effect).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);

  const isActive = (href: string) => (href === `/${locale}` ? pathname === href : pathname?.startsWith(href));

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-editorial ${scrolled ? "border-b border-line bg-night/75 backdrop-blur-xl" : "border-b border-transparent bg-transparent"}`}>
      <div className="mx-auto flex h-20 max-w-[var(--mendes-width-structural)] items-center justify-between gap-6 px-5 sm:px-8 lg:px-14">
        <Wordmark locale={locale} />

        <nav aria-label="Primary" className="hidden items-center gap-7 xl:flex">
          {items.map((item) => (
            <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? "page" : undefined} className={`link-grow py-1 text-[0.78rem] tracking-[0.06em] transition-colors duration-300 ${isActive(item.href) ? "text-gold-light" : "text-ivory/80 hover:text-ivory"}`}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher locale={locale} label={labels.language} />
          <Link href={portal.href} className="hidden rounded-[2px] border border-line px-4 py-2.5 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-ivory-muted transition-colors hover:border-gold hover:text-gold-light lg:inline-flex">
            {portal.label}
          </Link>
          <Link href={cta.href} className="btn-sheen hidden rounded-[2px] bg-gradient-to-br from-gold-light via-gold to-gold-deep px-5 py-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-night transition-transform hover:-translate-y-0.5 md:inline-flex">
            {cta.label}
          </Link>
          <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="mobile-nav" className="relative grid h-11 w-11 place-items-center rounded-full border border-line xl:hidden" aria-label={open ? labels.close : labels.menu}>
            <span className={`absolute h-px w-5 bg-ivory transition-all duration-500 ease-editorial ${open ? "rotate-45" : "-translate-y-1"}`} />
            <span className={`absolute h-px w-5 bg-ivory transition-all duration-500 ease-editorial ${open ? "-rotate-45" : "translate-y-1"}`} />
          </button>
        </div>
      </div>

      <div aria-hidden className="absolute bottom-0 h-px bg-gradient-to-r from-gold-deep via-gold to-gold-light transition-[width] duration-150 ltr:left-0 rtl:right-0" style={{ width: `${progress * 100}%` }} />

      <div id="mobile-nav" className={`fixed inset-0 top-20 z-40 bg-night/97 backdrop-blur-2xl transition-all duration-700 ease-editorial xl:hidden ${open ? "visible opacity-100" : "invisible opacity-0"}`}>
        <nav aria-label="Mobile" className="flex h-full flex-col justify-between overflow-y-auto px-8 pb-12 pt-10">
          <ul className="flex flex-col gap-1">
            {[...items, portal].map((item, i) => (
              <li key={item.href} style={{ transitionDelay: open ? `${80 + i * 50}ms` : "0ms" }} className={`transition-all duration-700 ease-editorial ${open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}>
                <Link href={item.href} className="block border-b border-line py-4 font-display text-3xl font-light text-ivory hover:text-gold-light">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link href={cta.href} className="mt-10 inline-flex justify-center rounded-[2px] bg-gradient-to-br from-gold-light via-gold to-gold-deep px-6 py-4 text-ui font-semibold uppercase tracking-[0.16em] text-night">
            {cta.label}
          </Link>
        </nav>
      </div>
    </header>
  );
}
