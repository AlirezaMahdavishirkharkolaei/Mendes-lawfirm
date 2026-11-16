import { attorneys } from "@/content/attorneys";
import { insights } from "@/content/insights";
import { href, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";

export interface NavItem {
  label: string;
  href: string;
}

/**
 * Primary navigation, shared by the desktop Nav, MobileNav and Footer.
 * Sections without content (no team profiles, no articles yet) are left
 * out rather than linking to empty pages.
 */
export function primaryNav(locale: Locale, t: Dictionary): NavItem[] {
  return [
    { label: t.nav.about, href: href(locale, "about") },
    { label: t.nav.practiceAreas, href: href(locale, "practice-areas") },
    ...(attorneys.length ? [{ label: t.nav.team, href: href(locale, "team") }] : []),
    ...(insights.length ? [{ label: t.nav.insights, href: href(locale, "insights") }] : []),
    { label: t.nav.contact, href: href(locale, "contact") },
  ];
}

export function consultationCta(locale: Locale, t: Dictionary): NavItem {
  return { label: t.nav.consultation, href: href(locale, "consultation") };
}

export function footerLegalLinks(locale: Locale, t: Dictionary): NavItem[] {
  return [
    { label: t.legal.privacyTitle, href: href(locale, "privacy") },
    { label: t.legal.disclaimerTitle, href: href(locale, "disclaimer") },
  ];
}

/** Replace {name} placeholders in dictionary strings. */
export function fill(s: string, vars: Record<string, string>): string {
  return s.replace(/\{(\w+)\}/g, (m, k: string) => vars[k] ?? m);
}
