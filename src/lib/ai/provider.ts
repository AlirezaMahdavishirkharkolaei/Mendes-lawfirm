import "server-only";
import { optional } from "@/lib/env";
import { getSetting, getSettings, setSettings } from "@/lib/settings";

/**
 * Provider-agnostic text generation.
 *
 * The provider is chosen in Admin → Settings (`ai_provider`, `ai_model`),
 * falling back to the AI_PROVIDER / AI_MODEL text bindings. Supported:
 *   gemini    — Google Gemini (free tier), key GEMINI_API_KEY   [default]
 *   anthropic — Claude, key ANTHROPIC_API_KEY
 *   groq      — Groq (OpenAI-compatible), key GROQ_API_KEY
 *   openai    — OpenAI, key OPENAI_API_KEY
 * Adding a provider = one more branch in `call()`.
 */

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface GenerateOptions {
  system: string;
  messages: ChatTurn[];
  json?: boolean;
  maxTokens?: number;
  temperature?: number;
}

export class AiUnavailable extends Error {}

const DEFAULT_MODELS: Record<string, string> = {
  gemini: "gemini-3.8-flash",
  anthropic: "claude-sonnet-5-5",
  groq: "llama-3.3-70b-versatile",
  openai: "gpt-4.1-mini",
};

/**
 * Gemini models tried in order after the configured one. Google retires model
 * IDs often (gemini-2.5-* started returning 404 for new keys), so a chat never
 * depends on a single ID: on 404 / 429 / 5xx the next one is used.
 */
const GEMINI_FALLBACKS = ["gemini-3.8-flash", "gemini-3.5-flash-lite", "gemini-flash-latest", "gemini-flash-lite-latest"];

const KEY_NAMES: Record<string, string> = {
  gemini: "GEMINI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  groq: "GROQ_API_KEY",
  openai: "OPENAI_API_KEY",
};

export async function aiConfig(): Promise<{ provider: string; model: string; configured: boolean }> {
  let settings: Record<string, string> = {};
  try {
    settings = await getSettings();
  } catch {
    /* settings table not ready — fall back to env */
  }
  const provider = (settings.ai_provider || optional("AI_PROVIDER") || "gemini").toLowerCase();
  const model = settings.ai_model || (provider === (optional("AI_PROVIDER") ?? "gemini") ? optional("AI_MODEL") : undefined) || DEFAULT_MODELS[provider] || "";
  return { provider, model, configured: !!optional(KEY_NAMES[provider] ?? "") };
}

async function call(provider: string, model: string, key: string, o: GenerateOptions): Promise<string> {
  const signal = AbortSignal.timeout(20_000);
  const maxTokens = o.maxTokens ?? 1200;
  const temperature = o.temperature ?? 0.4;

  if (provider === "gemini") {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      signal,
      headers: { "content-type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: o.system }] },
        contents: o.messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
        generationConfig: {
          temperature,
          // Thinking models spend part of this budget before answering, so leave headroom.
          maxOutputTokens: Math.max(maxTokens, 2048),
          ...(o.json ? { responseMimeType: "application/json" } : {}),
        },
      }),
    });
    if (!res.ok) throw new Error(`gemini ${model} ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const data = (await res.json()) as {
      candidates?: { finishReason?: string; content?: { parts?: { text?: string; thought?: boolean }[] } }[];
      promptFeedback?: { blockReason?: string };
    };
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.filter((p) => !p.thought).map((p) => p.text ?? "").join("") ?? "";
    if (!text.trim()) throw new Error(`gemini ${model} returned no text (${candidate?.finishReason ?? data.promptFeedback?.blockReason ?? "empty"})`);
    return text;
  }

  if (provider === "anthropic") {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal,
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature,
        system: o.json ? `${o.system}\n\nRespond with a single valid JSON object and nothing else.` : o.system,
        messages: o.messages,
      }),
    });
    if (!res.ok) throw new Error(`anthropic ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const data = (await res.json()) as { content?: { type: string; text?: string }[] };
    return data.content?.filter((c) => c.type === "text").map((c) => c.text).join("") ?? "";
  }

  if (provider === "groq" || provider === "openai") {
    const url = provider === "groq" ? "https://api.groq.com/openai/v1/chat/completions" : "https://api.openai.com/v1/chat/completions";
    const res = await fetch(url, {
      method: "POST",
      signal,
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature,
        messages: [{ role: "system", content: o.system }, ...o.messages],
        ...(o.json ? { response_format: { type: "json_object" } } : {}),
      }),
    });
    if (!res.ok) throw new Error(`${provider} ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return data.choices?.[0]?.message?.content ?? "";
  }

  throw new AiUnavailable(`Unknown AI provider "${provider}"`);
}

export interface AiStatus {
  ok: boolean;
  provider: string;
  model: string;
  error?: string;
  at: string;
}

/** Ordered list of (provider, model) attempts: the configured one first, then fallbacks. */
async function attempts(): Promise<{ provider: string; model: string; key: string }[]> {
  const { provider, model } = await aiConfig();
  const list: { provider: string; model: string; key: string }[] = [];
  const add = (p: string, m: string) => {
    const key = optional(KEY_NAMES[p] ?? "");
    if (key && m && !list.some((a) => a.provider === p && a.model === m)) list.push({ provider: p, model: m, key });
  };
  add(provider, model);
  if (provider === "gemini") for (const m of GEMINI_FALLBACKS) add("gemini", m);
  // Any other provider that has a key is a last resort.
  for (const p of Object.keys(KEY_NAMES)) if (p !== provider) add(p, DEFAULT_MODELS[p]);
  return list;
}

let lastStatus = "";
async function recordStatus(status: AiStatus) {
  const signature = `${status.ok}|${status.provider}|${status.model}|${status.error ?? ""}`;
  if (signature === lastStatus) return;
  lastStatus = signature;
  try {
    await setSettings({ _ai_status: JSON.stringify(status) });
  } catch {
    /* status is best-effort */
  }
}

/** Last AI call outcome, for the admin panel. */
export async function aiStatus(): Promise<AiStatus | null> {
  try {
    const raw = await getSetting("_ai_status");
    return raw ? (JSON.parse(raw) as AiStatus) : null;
  } catch {
    return null;
  }
}

export async function generateDetailed(options: GenerateOptions): Promise<{ text: string; provider: string; model: string }> {
  const list = await attempts();
  if (!list.length) {
    const { provider } = await aiConfig();
    throw new AiUnavailable(`No API key configured for ${provider}`);
  }
  const errors: string[] = [];
  for (const a of list) {
    try {
      const text = await call(a.provider, a.model, a.key, options);
      await recordStatus({ ok: true, provider: a.provider, model: a.model, error: errors.join(" | ") || undefined, at: new Date().toISOString() });
      return { text, provider: a.provider, model: a.model };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }
  const last = list[list.length - 1];
  await recordStatus({ ok: false, provider: last.provider, model: last.model, error: errors.join(" | ").slice(0, 900), at: new Date().toISOString() });
  throw new Error(`All AI models failed: ${errors.join(" | ")}`);
}

export async function generate(options: GenerateOptions): Promise<string> {
  return (await generateDetailed(options)).text;
}

/** Generates and parses a JSON object. Tolerates code fences around it. */
export async function generateJson<T>(options: Omit<GenerateOptions, "json">): Promise<T> {
  const raw = await generate({ ...options, json: true });
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("AI did not return JSON");
  return JSON.parse(cleaned.slice(start, end + 1)) as T;
}
