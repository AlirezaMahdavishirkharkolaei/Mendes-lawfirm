import { adminLang, adminT } from "@/lib/admin-i18n";
import type { ReactNode } from "react";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminNav } from "@/components/admin/AdminNav";
import { adminLogout, setAdminLang } from "@/app/(system)/admin/actions";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const user = await requireUser(["admin", "lawyer"], "/admin/login");
  const t = await adminT();
  const lang = await adminLang();
  const database = await db();
  const counts = await database
    .prepare(
      `SELECT
        (SELECT COUNT(*) FROM bookings WHERE status='pending') AS bookings,
        (SELECT COUNT(*) FROM articles WHERE status='submitted') AS articles,
        (SELECT COUNT(*) FROM outreach_messages WHERE status='draft' AND direction='outbound') AS drafts`,
    )
    .first<{ bookings: number; articles: number; drafts: number }>();
  const admin = user.role === "admin";
  const items = [
    { href: "/admin", label: t("Dashboard") },
    { href: "/admin/bookings", label: t("Bookings"), badge: counts?.bookings },
    { href: "/admin/cases", label: t("Cases") },
    { href: "/admin/users", label: t("Users") },
    { href: "/admin/articles", label: t("Articles"), badge: counts?.articles },
    { href: "/admin/laws", label: t("Cyprus laws") },
    ...(admin
      ? [
          { href: "/admin/outreach", label: t("AI outreach"), badge: counts?.drafts },
          { href: "/admin/chats", label: t("AI chats") },
          { href: "/admin/team", label: t("Team") },
          { href: "/admin/content", label: t("Site content") },
          { href: "/admin/settings", label: t("Settings") },
          { href: "/admin/audit", label: t("Activity log") },
        ]
      : []),
  ];
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-line bg-night-2 p-5 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-e lg:p-6">
        <Link href="/admin" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/mendes-crest-sm.webp" alt="" width={34} height={42} className="h-11 w-9 object-contain" />
          <span>
            <span className="block font-display text-lg uppercase tracking-[0.3em]">{t("Mendes")}</span>
            <span className="block font-mono text-[0.55rem] uppercase tracking-[0.3em] text-ivory-muted">{t("Control room")}</span>
          </span>
        </Link>
        <div className="mt-6 lg:mt-10"><AdminNav items={items} /></div>
        <div className="mt-6 hidden border-t border-line pt-6 lg:block">
          <p className="text-ui text-ivory">{user.name}</p>
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-ivory-muted">{user.role}</p>
          <div className="mt-4 flex gap-4 text-ui-sm">
            <Link href="/en" className="text-ivory-muted hover:text-gold-light">{t("View site ↗")}</Link>
            <form action={adminLogout}><button className="text-ivory-muted hover:text-danger">{t("Sign out")}</button></form>
          </div>
          <form action={setAdminLang} className="mt-4 flex gap-1">
            {(["en", "tr"] as const).map((l) => (
              <button key={l} name="lang" value={l} className={`rounded-full border px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.14em] ${lang === l ? "border-gold bg-gold/15 text-gold-light" : "border-line text-ivory-muted hover:text-ivory"}`}>
                {l === "en" ? "English" : "Türkçe"}
              </button>
            ))}
          </form>
        </div>
      </aside>
      <main className="min-w-0 p-5 md:p-10 lg:p-14">{children}</main>
    </div>
  );
}
