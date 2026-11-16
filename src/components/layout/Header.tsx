"use client";

import { useEffect, useState } from "react";
import { Wordmark } from "./Wordmark";
import { Nav } from "./Nav";
import { MobileNav } from "./MobileNav";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { PageContainer } from "./Container";
import { Button } from "@/components/ui";
import type { NavItem } from "@/lib/navigation";
import type { Locale } from "@/i18n/config";

interface HeaderProps {
  locale: Locale;
  items: NavItem[];
  cta: NavItem;
  labels: { menu: string; close: string; primary: string; language: string };
}

/**
 * Global site header. Restrained by design: no blur, no shadow. The only
 * scroll behaviour is a hairline border that fades in after a small
 * scroll, set from the scroll listener only (never on mount).
 */
export function Header({ locale, items, cta, labels }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b bg-surface transition-colors duration-[175ms] ease-editorial ${
        scrolled ? "border-border" : "border-transparent"
      }`}
    >
      <PageContainer className="flex h-16 items-center justify-between gap-6 md:h-20">
        <Wordmark locale={locale} />

        <div className="hidden items-center gap-8 lg:flex">
          <Nav items={items} label={labels.primary} />
          <LanguageSwitcher current={locale} label={labels.language} />
          <Button href={cta.href} variant="primary" className="text-ui-sm">
            {cta.label}
          </Button>
        </div>

        <MobileNav items={[...items, cta]} locale={locale} labels={labels} />
      </PageContainer>
    </header>
  );
}
