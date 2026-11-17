import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

/**
 * Layout for the public marketing site. Header and Footer are defined
 * here — once — rather than in individual pages, so every route under
 * (marketing) gets them automatically. This is also where the single
 * #main-content landmark lives, which src/app/layout.tsx's SkipLink
 * targets.
 */
export default function MarketingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <Header />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
