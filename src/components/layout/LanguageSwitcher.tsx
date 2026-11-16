"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, localeMeta, type Locale } from "@/i18n/config";

interface LanguageSwitcherProps {
  current: Locale;
  label: string;
  onDark?: boolean;
  className?: string;
}

/** Same page in another language: swaps the first path segment. */
export function LanguageSwitcher({ current, label, onDark = false, className = "" }: LanguageSwitcherProps) {
  const pathname = usePathname() || `/${current}/`;
  const rest = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/";

  return (
    <nav aria-label={label} className={className}>
      <ul className="flex items-center gap-3">
        {locales.map((l) => {
          const active = l === current;
          return (
            <li key={l}>
              <Link
                href={`/${l}${rest.endsWith("/") ? rest : `${rest}/`}`}
                hrefLang={localeMeta[l].htmlLang}
                lang={localeMeta[l].htmlLang}
                aria-current={active ? "true" : undefined}
                title={localeMeta[l].name}
                className={`font-mono text-ui-sm tracking-mono transition-colors duration-[175ms] ease-editorial ${
                  active
                    ? onDark
                      ? "text-accent-on-dark underline underline-offset-4"
                      : "text-accent underline underline-offset-4"
                    : onDark
                      ? "text-ink-dark/70 hover:text-ink-dark"
                      : "text-ink-muted hover:text-ink"
                }`}
              >
                {localeMeta[l].label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
