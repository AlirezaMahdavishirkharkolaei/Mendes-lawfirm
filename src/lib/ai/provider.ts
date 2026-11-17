import "server-only";
import { optional } from "@/lib/env";
import { getSettings } from "@/lib/settings";

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
  gemini: "gemini-2.5-flash",
  anthropic: "claude-sonnet-5-5",
  groq: "llama-3.3-70b-versatile",
  openai: "gpt-4.1-mini",
};

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
  const signal = AbortSignal.timeout(30_000);
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
          maxOutputTokens: maxTokens,
          ...(o.json ? { responseMimeType: "application/json" } : {}),
        },
      }),
    });
    if (!res.ok) throw new Error(`gemini ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    return data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
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

export async function generate(options: GenerateOptions): Promise<string> {
  const { provider, model } = await aiConfig();
  const key = optional(KEY_NAMES[provider] ?? "");
  if (!key) throw new AiUnavailable(`No API key configured for ${provider}`);
  return call(provider, model, key, options);
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
