import type { Metadata } from "next";
import "./globals.css";
import { SkipLink } from "@/components/ui";

// NOTE: Typography direction is approved (Design System Proposal v0.1 —
// "The Citation Mark": Fraunces / IBM Plex Sans / IBM Plex Mono), but the
// licensed font files are not yet in the repository. See
// src/lib/fonts.ts and src/assets/fonts/README.md for the self-hosted
// activation path — until then, globals.css falls back to system fonts
// via the same --font-display/--font-body/--font-mono custom properties,
// so nothing here depends on a runtime Google Fonts request.

export const metadata: Metadata = {
  title: "Mendes",
  description:
    "Mendes — a premium, technology-oriented law firm. Foundation build.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-surface text-ink font-body">
        <SkipLink targetId="main-content" />
        {children}
      </body>
    </html>
  );
}
