import type { ReactNode } from "react";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminNav } from "@/components/admin/AdminNav";
import { adminLogout } from "@/app/(system)/admin/actions";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const user = await requireUser(["admin", "lawyer"], "/admin/login");
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
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/bookings", label: "Bookings", badge: counts?.bookings },
    { href: "/admin/cases", label: "Cases" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/articles", label: "Articles", badge: counts?.articles },
    { href: "/admin/laws", label: "Cyprus laws" },
    ...(admin
      ? [
          { href: "/admin/outreach", label: "AI outreach", badge: counts?.drafts },
          { href: "/admin/chats", label: "AI chats" },
          { href: "/admin/team", label: "Team" },
          { href: "/admin/content", label: "Site content" },
          { href: "/admin/settings", label: "Settings" },
          { href: "/admin/audit", label: "Activity log" },
        ]
      : []),
  ];
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-line bg-night-2 p-5 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-e lg:p-6">
        <Link href="/admin" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full border border-gold/50 font-display text-2xl italic text-gold">§</span>
          <span>
            <span className="block font-display text-lg uppercase tracking-[0.3em]">Mendes</span>
            <span className="block font-mono text-[0.55rem] uppercase tracking-[0.3em] text-ivory-muted">Control room</span>
          </span>
        </Link>
        <div className="mt-6 lg:mt-10"><AdminNav items={items} /></div>
        <div className="mt-6 hidden border-t border-line pt-6 lg:block">
          <p className="text-ui text-ivory">{user.name}</p>
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-ivory-muted">{user.role}</p>
          <div className="mt-4 flex gap-4 text-ui-sm">
            <Link href="/en" className="text-ivory-muted hover:text-gold-light">View site ↗</Link>
            <form action={adminLogout}><button className="text-ivory-muted hover:text-danger">Sign out</button></form>
          </div>
        </div>
      </aside>
      <main className="min-w-0 p-5 md:p-10 lg:p-14">{children}</main>
    </div>
  );
}
