import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import type { Locale } from "./config";
import en, { type Dictionary } from "./dictionaries/en";
import tr from "./dictionaries/tr";
import fa from "./dictionaries/fa";
import ru from "./dictionaries/ru";
import ar from "./dictionaries/ar";

const dictionaries: Record<Locale, Dictionary> = { en, tr, fa, ru, ar };

/** Keys whose copy may be overridden per locale in Admin → Content. */
export const EDITABLE_KEYS = [
  "home.eyebrow",
  "home.headline",
  "home.sub",
  "home.philosophyQuote",
  "home.ctaTitle",
  "home.ctaSub",
  "about.lead",
  "about.p1",
  "about.p2",
  "footer.disclaimer",
] as const;

function setPath(target: Record<string, unknown>, path: string, value: string) {
  const parts = path.split(".");
  let node = target;
  for (const part of parts.slice(0, -1)) {
    if (typeof node[part] !== "object" || node[part] === null) return;
    node = node[part] as Record<string, unknown>;
  }
  const last = parts[parts.length - 1];
  if (typeof node[last] === "string") node[last] = value;
}

export function getPath(source: unknown, path: string): string {
  let node = source as Record<string, unknown> | undefined;
  for (const part of path.split(".")) node = node?.[part] as Record<string, unknown> | undefined;
  return typeof node === "string" ? node : "";
}

export function staticDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? en;
}

/** Dictionary for a request, with admin overrides applied. Cached per request. */
export const getDictionary = cache(async (locale: Locale): Promise<Dictionary> => {
  const base = structuredClone(dictionaries[locale] ?? en);
  try {
    const database = await db();
    const rows = await database
      .prepare("SELECT key, value FROM content_overrides WHERE locale = ?")
      .bind(locale)
      .all<{ key: string; value: string }>();
    for (const row of rows.results ?? []) setPath(base as unknown as Record<string, unknown>, row.key, row.value);
  } catch (error) {
    console.error("content overrides unavailable", error);
  }
  return base;
});

export type { Dictionary };
