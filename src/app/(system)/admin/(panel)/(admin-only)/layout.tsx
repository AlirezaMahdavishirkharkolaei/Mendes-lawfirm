import type { ReactNode } from "react";
import { requireUser } from "@/lib/auth";

/** Firm-wide controls (settings, team, outreach, content, logs) are admin-only. */
export default async function AdminOnly({ children }: { children: ReactNode }) {
  await requireUser(["admin"], "/admin/login");
  return <>{children}</>;
}
