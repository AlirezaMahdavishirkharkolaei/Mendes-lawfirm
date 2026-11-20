import "server-only";
import { optional } from "@/lib/env";
import { rateLimit } from "@/lib/security/rate-limit";

/**
 * Web search for the chatbot, via Tavily (free plan: 1,000 searches a month,
 * no card). Enabled when the TAVILY_API_KEY secret is set and the
 * "web_search_enabled" setting is on.
 */
export interface SearchResult {
  title: string;
  url: string;
  content: string;
}

/** Stays inside the free plan: about 30 searches a day across all visitors. */
const DAILY_CAP = 30;

export function webSearchConfigured(): boolean {
  return !!optional("TAVILY_API_KEY");
}

export async function webSearch(query: string): Promise<SearchResult[]> {
  const key = optional("TAVILY_API_KEY");
  if (!key) return [];
  if (!(await rateLimit("websearch:global", DAILY_CAP, 86_400))) return [];
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    signal: AbortSignal.timeout(12_000),
    headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
    body: JSON.stringify({ query: query.slice(0, 300), search_depth: "basic", max_results: 5, include_answer: false }),
  });
  if (!res.ok) throw new Error(`tavily ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = (await res.json()) as { results?: { title?: string; url?: string; content?: string }[] };
  return (data.results ?? [])
    .filter((r) => r.url && /^https:\/\//.test(r.url))
    .map((r) => ({ title: (r.title ?? r.url!).slice(0, 160), url: r.url!, content: (r.content ?? "").slice(0, 900) }));
}
