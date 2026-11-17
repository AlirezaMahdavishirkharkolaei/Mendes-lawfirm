import "server-only";
import { env } from "cloudflare:workers";

/**
 * Typed access to the Worker environment. Optional provider keys that are
 * not declared in cloudflare.config.ts (ANTHROPIC_API_KEY, GROQ_API_KEY,
 * OPENAI_API_KEY) are read through `optional()` so that adding one is a
 * dashboard change, not a code change.
 */
export function getEnv(): Env {
  return env as Env;
}

export function optional(name: string): string | undefined {
  const value = (env as unknown as Record<string, unknown>)[name];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

/**
 * Public base URL used in e-mail links. Order: the SITE_URL binding (when
 * set to a real domain) → the host of the current request (remembered in
 * settings so cron jobs can use it too) → the remembered value → localhost.
 */
export async function siteUrl(): Promise<string> {
  const configured = optional("SITE_URL");
  if (configured && !configured.includes("localhost")) return configured.replace(/\/$/, "");
  const { getSetting, setSettings } = await import("@/lib/settings");
  try {
    const { headers } = await import("next/headers");
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (host) {
      const proto = host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https";
      const url = `${proto}://${host}`;
      if (proto === "https" && (await getSetting("site_url")) !== url) await setSettings({ site_url: url });
      return url;
    }
  } catch {
    /* no request (cron / email handler) */
  }
  return (await getSetting("site_url")) || configured || "http://localhost:3001";
}
