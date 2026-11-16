import type { Metadata } from "next";
import "@fontsource-variable/fraunces";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource-variable/vazirmatn";
import "./globals.css";

export const metadata: Metadata = { title: "404 | Mendes", robots: { index: false } };

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** 404 for any unmatched URL, in all three languages. */
export default function GlobalNotFound() {
  const items = [
    { l: "en", title: "Page not found", home: "Home" },
    { l: "tr", title: "Sayfa bulunamadı", home: "Ana sayfa" },
    { l: "fa", title: "صفحه پیدا نشد", home: "خانه" },
  ];
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-10 bg-surface px-6 text-center text-ink">
        <p className="font-mono text-ui-sm tracking-mono text-ink-muted">§ 404</p>
        <p className="font-display text-display tracking-display">Mendes</p>
        <ul className="flex flex-col gap-6 sm:flex-row sm:gap-12">
          {items.map((i) => (
            <li key={i.l} lang={i.l} dir={i.l === "fa" ? "rtl" : "ltr"} className="flex flex-col gap-2">
              <span className="font-body text-lead">{i.title}</span>
              {/* Plain <a>: this page renders outside the app router. */}
              <a href={`${basePath}/${i.l}/`} className="font-mono text-ui-sm uppercase tracking-mono text-accent underline underline-offset-4">
                {i.home}
              </a>
            </li>
          ))}
        </ul>
      </body>
    </html>
  );
}
