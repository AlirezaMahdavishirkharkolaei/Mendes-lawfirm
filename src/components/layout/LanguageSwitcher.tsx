"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { locales, localeMeta, type Locale } from "@/lib/i18n/config";

export function LanguageSwitcher({ locale, label }: { locale: string; label: string }) {
  const pathname = usePathname() ?? `/${locale}`;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const swap = (target: Locale) => {
    const parts = pathname.split("/");
    parts[1] = target;
    return parts.join("/") || `/${target}`;
  };

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-haspopup="listbox" aria-expanded={open} aria-label={label} className="flex h-11 items-center gap-2 rounded-full border border-line px-3.5 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-ivory-muted transition-colors hover:border-gold hover:text-gold-light">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
          <circle cx="12" cy="12" r="9.5" />
          <path d="M2.5 12h19M12 2.5c2.8 3 2.8 16 0 19M12 2.5c-2.8 3-2.8 16 0 19" />
        </svg>
        {locale}
      </button>
      <ul role="listbox" className={`absolute end-0 top-full mt-2 w-44 overflow-hidden rounded-[3px] border border-line bg-night-2/95 backdrop-blur-xl transition-all duration-300 ease-editorial ${open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"}`}>
        {locales.map((l) => (
          <li key={l} role="option" aria-selected={l === locale}>
            <Link href={swap(l)} hrefLang={l} onClick={() => { document.cookie = `mendes_locale=${l};path=/;max-age=31536000;samesite=lax`; }} className={`flex items-center justify-between px-4 py-3 text-ui transition-colors hover:bg-gold/10 ${l === locale ? "text-gold-light" : "text-ivory/85"}`}>
              <span dir={localeMeta[l].dir}>{localeMeta[l].native}</span>
              <span className="font-mono text-[0.6rem] uppercase text-ivory-muted">{l}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
