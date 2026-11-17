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

export function siteUrl(): string {
  return (optional("SITE_URL") ?? "http://localhost:3001").replace(/\/$/, "");
}
