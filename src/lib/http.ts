import "server-only";
import { headers } from "next/headers";
import { siteUrl } from "@/lib/env";

export async function clientIp(): Promise<string | null> {
  const h = await headers();
  return h.get("cf-connecting-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

/** Rejects cross-site POSTs to JSON route handlers (server actions already check Origin). */
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const o = new URL(origin);
    const self = new URL(request.url);
    return o.host === self.host || o.host === new URL(siteUrl()).host;
  } catch {
    return false;
  }
}
