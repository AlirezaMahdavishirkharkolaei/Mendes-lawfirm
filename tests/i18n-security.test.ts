import { describe, expect, it } from "vitest";
import en from "@/lib/i18n/dictionaries/en";
import tr from "@/lib/i18n/dictionaries/tr";
import fa from "@/lib/i18n/dictionaries/fa";
import ru from "@/lib/i18n/dictionaries/ru";
import ar from "@/lib/i18n/dictionaries/ar";
import { negotiateLocale, pick } from "@/lib/i18n/config";
import { privacy, terms } from "@/content/legal";
import { hashPassword, needsRehash, signPayload, verifyPassword, verifyPayload } from "@/lib/security/crypto";

function paths(obj: unknown, prefix = ""): string[] {
  if (typeof obj !== "object" || obj === null) return [prefix];
  return Object.entries(obj).flatMap(([k, v]) => paths(v, prefix ? `${prefix}.${k}` : k));
}

describe("dictionaries", () => {
  const reference = paths(en).sort();
  for (const [name, dict] of Object.entries({ tr, fa, ru, ar })) {
    it(`${name} has exactly the same keys as English, none empty`, () => {
      expect(paths(dict).sort()).toEqual(reference);
      for (const p of paths(dict)) {
        const value = p.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown>)[k], dict);
        expect(String(value).trim(), p).not.toBe("");
      }
    });
  }
  it("has legal pages in every language with the same number of sections", () => {
    for (const doc of [privacy, terms]) {
      const n = doc.en.sections.length;
      for (const l of ["tr", "fa", "ru", "ar"] as const) expect(doc[l].sections).toHaveLength(n);
    }
  });
  it("negotiates the visitor's language", () => {
    expect(negotiateLocale("fa-IR,fa;q=0.9,en;q=0.8")).toBe("fa");
    expect(negotiateLocale("de-DE,de;q=0.9")).toBe("en");
    expect(pick({ en: "Hello", tr: "" }, "tr")).toBe("Hello");
  });
});

describe("security", () => {
  it("hashes and verifies passwords, and flags old hashes for rehash", async () => {
    const hash = await hashPassword("correct horse battery");
    expect(await verifyPassword("correct horse battery", hash)).toBe(true);
    expect(await verifyPassword("wrong", hash)).toBe(false);
    expect(needsRehash(hash)).toBe(false);
    expect(needsRehash("pbkdf2$100000$abc$def")).toBe(true);
  });
  it("signs payloads and rejects tampering or expiry", async () => {
    const token = await signPayload({ b: "booking-1", p: "booking" }, 60);
    expect((await verifyPayload<{ b: string }>(token))?.b).toBe("booking-1");
    expect(await verifyPayload(token.slice(0, -3) + "AAA")).toBeNull();
    expect(await verifyPayload(await signPayload({ b: "x" }, -1))).toBeNull();
  });
});
