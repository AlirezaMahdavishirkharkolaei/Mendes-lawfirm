"use client";

import { useEffect, useState } from "react";
import { Wordmark } from "./Wordmark";
import { Nav } from "./Nav";
import { MobileNav } from "./MobileNav";
import { PageContainer } from "./Container";
import { Button } from "@/components/ui";
import { primaryNav, consultationCta } from "@/lib/navigation";

/**
 * Global site header. Restrained by design: no blur, no shadow, no
 * transparency-over-hero trick (that would assume a hero background
 * this phase doesn't build yet). The only scroll behavior is a hairline
 * border that fades in once the page has scrolled past a small
 * threshold, for a subtle separation from content — set from the
 * scroll listener only (never synchronously on mount) so the initial
 * render is always the clean, borderless state.
 */
export function Header() {
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
      <PageContainer className="flex h-16 items-center justify-between md:h-20">
        <Wordmark />

        <div className="hidden items-center gap-8 lg:flex">
          <Nav items={primaryNav} />
          <Button href={consultationCta.href} variant="primary" className="text-ui-sm">
            {consultationCta.label}
          </Button>
        </div>

        <MobileNav items={[...primaryNav, consultationCta]} />
      </PageContainer>
    </header>
  );
}
