import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../globals.css";

export const metadata: Metadata = { title: "Mendes", robots: { index: false, follow: false } };

export default function SystemLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr" className="h-full">
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
