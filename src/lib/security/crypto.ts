import "server-only";
import { optional } from "@/lib/env";
import { db } from "@/lib/db";

const enc = new TextEncoder();

function toB64Url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (const b of arr) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64Url(value: string): Uint8Array {
  const b64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "===".slice((b64.length + 3) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

export function randomToken(bytes = 32): string {
  return toB64Url(crypto.getRandomValues(new Uint8Array(bytes)));
}

export async function sha256(value: string): Promise<string> {
  return toB64Url(await crypto.subtle.digest("SHA-256", enc.encode(value)));
}

/** Constant-time string comparison. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// ── Passwords: PBKDF2-SHA256 (100k iterations is the Workers maximum) ──
const ITERATIONS = 100_000;

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: ITERATIONS },
    key,
    256,
  );
  return `pbkdf2$${ITERATIONS}$${toB64Url(salt)}$${toB64Url(bits)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, iter, saltB64, hashB64] = stored.split("$");
  if (scheme !== "pbkdf2" || !iter || !saltB64 || !hashB64) return false;
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: fromB64Url(saltB64) as BufferSource, iterations: Number(iter) },
    key,
    256,
  );
  return safeEqual(toB64Url(bits), hashB64);
}

// ── Signed tokens (HMAC-SHA256) for e-mail action links ────────────────
let generated: string | null = null;

/**
 * Signing secret: the AUTH_SECRET Worker secret when set (recommended),
 * otherwise a random secret generated once and kept in D1, so the
 * platform works straight after the first deploy.
 */
async function authSecret(): Promise<string> {
  const configured = optional("AUTH_SECRET");
  if (configured && configured.length >= 16) return configured;
  if (generated) return generated;
  const database = await db();
  const row = await database.prepare("SELECT value FROM settings WHERE key = '_auth_secret'").first<{ value: string }>();
  if (row?.value) return (generated = row.value);
  const fresh = randomToken(48);
  await database.prepare("INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES ('_auth_secret', ?, ?)").bind(fresh, new Date().toISOString()).run();
  const stored = await database.prepare("SELECT value FROM settings WHERE key = '_auth_secret'").first<{ value: string }>();
  return (generated = stored?.value ?? fresh);
}

async function hmacKey(): Promise<CryptoKey> {
  const secret = await authSecret();
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

export async function signPayload(payload: Record<string, unknown>, ttlSeconds: number): Promise<string> {
  const body = toB64Url(enc.encode(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + ttlSeconds })));
  const sig = toB64Url(await crypto.subtle.sign("HMAC", await hmacKey(), enc.encode(body)));
  return `${body}.${sig}`;
}

export async function verifyPayload<T extends Record<string, unknown>>(token: string): Promise<T | null> {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  let ok = false;
  try {
    ok = await crypto.subtle.verify("HMAC", await hmacKey(), fromB64Url(sig) as BufferSource, enc.encode(body));
  } catch {
    return null;
  }
  if (!ok) return null;
  try {
    const data = JSON.parse(new TextDecoder().decode(fromB64Url(body))) as T & { exp: number };
    if (typeof data.exp !== "number" || data.exp < Date.now() / 1000) return null;
    return data;
  } catch {
    return null;
  }
}

export async function hashIp(ip: string | null): Promise<string | null> {
  if (!ip) return null;
  return (await sha256(`${ip}|${await authSecret()}`)).slice(0, 22);
}
