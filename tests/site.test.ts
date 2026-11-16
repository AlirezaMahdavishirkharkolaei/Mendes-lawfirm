import { describe, expect, it } from "vitest";
import { en } from "@/i18n/dictionaries/en";
import { tr } from "@/i18n/dictionaries/tr";
import { fa } from "@/i18n/dictionaries/fa";
import { href, isLocale, locales } from "@/i18n/config";
import { practiceAreas } from "@/content/practice-areas";
import { attorneys } from "@/content/attorneys";
import { insights } from "@/content/insights";
import { firm } from "@/content/firm";
import { consultationBody, consultationErrors, mailtoHref } from "@/lib/schemas/consultation-request";
import { fill } from "@/lib/navigation";
import sitemap from "@/app/sitemap";

/** Every leaf path of a dictionary, with array lengths, so the three languages can be compared. */
function shape(o: unknown, p = ""): string[] {
  if (Array.isArray(o)) return [`${p}[${o.length}]`, ...o.flatMap((x, i) => shape(x, `${p}[${i}]`))];
  if (o && typeof o === "object") return Object.entries(o).flatMap(([k, v]) => shape(v, p ? `${p}.${k}` : k));
  return [p];
}
const leaves = (o: unknown): string[] =>
  Array.isArray(o) ? o.flatMap(leaves) : o && typeof o === "object" ? Object.values(o).flatMap(leaves) : [String(o)];

describe("dictionaries", () => {
  it("tr and fa have exactly the English structure, including list lengths", () => {
    expect(shape(tr)).toEqual(shape(en));
    expect(shape(fa)).toEqual(shape(en));
  });
  it("no empty strings, and placeholders survive translation", () => {
    for (const d of [en, tr, fa]) for (const s of leaves(d)) expect(s.trim()).not.toBe("");
    expect(tr.consultation.privacyNote).toContain("{email}");
    expect(fa.consultation.sentText).toContain("{email}");
    expect(fa.legal.privacy.at(-1)).toContain("{email}");
  });
  it("translations are really translated", () => {
    expect(tr.home.lead).not.toBe(en.home.lead);
    expect(fa.home.lead).toMatch(/[؀-ۿ]/);
  });
});

describe("content", () => {
  it("practice areas are complete in three languages with unique URL-safe slugs", () => {
    const slugs = practiceAreas.map((a) => a.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const a of practiceAreas) for (const l of locales) {
      expect(a.title[l]).toBeTruthy();
      expect(a.services[l].length).toBeGreaterThan(0);
    }
  });
  it("team and articles only reference real practice areas and team members", () => {
    const areas = new Set(practiceAreas.map((a) => a.slug));
    const people = new Set(attorneys.map((a) => a.slug));
    for (const a of attorneys) for (const s of a.practiceAreaSlugs) expect(areas.has(s)).toBe(true);
    for (const i of insights) {
      for (const s of i.practiceAreaSlugs) expect(areas.has(s)).toBe(true);
      if (i.authorSlug) expect(people.has(i.authorSlug)).toBe(true);
    }
    for (const a of practiceAreas) for (const s of a.relatedAttorneySlugs) expect(people.has(s)).toBe(true);
  });
  it("no placeholder or demonstration text is published", () => {
    const all = JSON.stringify({ practiceAreas, attorneys, insights, firm, en, tr, fa });
    expect(all).not.toMatch(/placeholder|lorem ipsum|example\.com|demonstration/i);
  });
});

describe("routing helpers", () => {
  it("builds language-prefixed paths with a trailing slash", () => {
    expect(href("tr")).toBe("/tr/");
    expect(href("fa", "/practice-areas/real-estate")).toBe("/fa/practice-areas/real-estate/");
    expect(isLocale("de")).toBe(false);
  });
  it("sitemap lists every page in every language", () => {
    const urls = sitemap().map((u) => u.url);
    expect(urls).toContain(`${firm.siteUrl}/fa/practice-areas/family-law/`);
    expect(urls.length % locales.length).toBe(0);
    expect(urls.some((u) => u.includes("/team/"))).toBe(attorneys.length > 0);
  });
});

describe("consultation request", () => {
  const ok = { fullName: "Ayşe Yılmaz", email: "ayse@example.org", phone: "+90 548 000 00 00", preferredLanguage: "tr", message: "I would like advice on buying a flat.", practiceAreaSlug: "real-estate", companyWebsite: "" };
  it("accepts a complete request and flags each missing field", () => {
    expect(consultationErrors(ok)).toBeNull();
    expect(Object.keys(consultationErrors({ ...ok, fullName: "A", email: "x", message: "short" }) ?? {}).sort()).toEqual(["email", "fullName", "message"]);
  });
  it("rejects the honeypot being filled in", () => {
    expect(consultationErrors({ ...ok, companyWebsite: "spam.example" })).not.toBeNull();
  });
  it("builds a readable email", () => {
    const body = consultationBody(ok as never, "Real estate & property");
    expect(body).toContain("Name: Ayşe Yılmaz");
    expect(body).toContain("Practice area: Real estate & property");
    const link = mailtoHref(firm.email, "Consultation request", body);
    expect(link.startsWith(`mailto:${firm.email}?subject=Consultation%20request`)).toBe(true);
    expect(link).not.toContain("+");
  });
  it("fills placeholders", () => {
    expect(fill("write to {email}", { email: "a@b.c" })).toBe("write to a@b.c");
  });
});
