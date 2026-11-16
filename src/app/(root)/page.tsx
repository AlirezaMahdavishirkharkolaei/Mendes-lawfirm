import type { Metadata } from "next";
import Link from "next/link";
import { locales, localeMeta, defaultLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get";
import { firm } from "@/content/firm";

export const metadata: Metadata = {
  metadataBase: new URL(`${firm.siteUrl}/`),
  title: "Mendes | Law and Consultancy",
  description: getDictionary("en").meta.siteDescription,
  alternates: { canonical: "en/", languages: { ...Object.fromEntries(locales.map((l) => [l, `${l}/`])), "x-default": "en/" } },
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * "/" has no content of its own: it sends visitors to their browser's
 * language (or English), and shows plain links if JavaScript is off.
 */
export default function LanguagePicker() {
  const script = `(function(){var s=${JSON.stringify(locales)};var l=(navigator.languages||[navigator.language||""]).map(function(x){return String(x).slice(0,2).toLowerCase()}).find(function(x){return s.indexOf(x)>-1})||${JSON.stringify(defaultLocale)};location.replace(${JSON.stringify(basePath)}+"/"+l+"/");})();`;
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-24 text-center">
      <script dangerouslySetInnerHTML={{ __html: script }} />
      <p className="font-display text-display tracking-display">Mendes</p>
      <ul className="flex flex-col gap-4 sm:flex-row sm:gap-10">
        {locales.map((l) => (
          <li key={l}>
            <Link href={`/${l}/`} lang={l} className="flex flex-col items-center gap-1 hover:text-accent">
              <span className="font-mono text-ui-sm uppercase tracking-mono text-ink-muted">{getDictionary(l).langPicker.title}</span>
              <span className="font-display text-h2">{localeMeta[l].name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
