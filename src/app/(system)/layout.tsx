import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../globals.css";
import { themeBootScript } from "@/lib/boot-scripts";

export const metadata: Metadata = { title: "Mendes", robots: { index: false, follow: false } };

export default function SystemLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr" className="h-full" suppressHydrationWarning>
      <body className="min-h-full antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        {children}
      </body>
    </html>
  );
}
