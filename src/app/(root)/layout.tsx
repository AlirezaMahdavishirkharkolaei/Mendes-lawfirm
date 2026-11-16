import type { ReactNode } from "react";
import "@fontsource-variable/fraunces";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource-variable/vazirmatn";
import "../globals.css";

/** Root layout for the language picker at "/" only. Every real page lives under /[lang]. */
export default function RootPickerLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-surface font-body text-ink">{children}</body>
    </html>
  );
}
