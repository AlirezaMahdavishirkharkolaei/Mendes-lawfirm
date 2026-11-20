import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { db, now, uuid } from "@/lib/db";
import { hashPassword, needsRehash, randomToken, sha256, verifyPassword } from "@/lib/security/crypto";

export type Role = "client" | "lawyer" | "admin" | "author";

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: Role;
  university: string | null;
  bio: string | null;
  slug: string | null;
  locale: string;
  is_active: number;
  created_at: string;
}

const COOKIE = "mendes_session";
const SESSION_DAYS = 14;
const USER_COLUMNS = "id, email, name, phone, role, university, bio, slug, locale, is_active, created_at";

/** Unusable random password for invited accounts (they set their own via e-mail). */
export function randomPassword(): string {
  return randomToken(24);
}

export function slugify(value: string): string {
  return (
    value
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9؀-ۿЀ-ӿ]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "item"
  );
}

async function uniqueUserSlug(name: string): Promise<string> {
  const database = await db();
  const base = slugify(name);
  for (let i = 0; i < 20; i++) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    const taken = await database.prepare("SELECT 1 FROM users WHERE slug = ?").bind(candidate).first();
    if (!taken) return candidate;
  }
  return `${base}-${randomToken(4).toLowerCase()}`;
}

export async function createUser(input: {
  email: string;
  name: string;
  password: string;
  role: Role;
  phone?: string | null;
  university?: string | null;
  locale?: string;
}): Promise<User> {
  const database = await db();
  const id = uuid();
  const slug = await uniqueUserSlug(input.name);
  await database
    .prepare(
      `INSERT INTO users (id, email, name, phone, password_hash, role, university, slug, locale, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      input.email.trim().toLowerCase(),
      input.name.trim(),
      input.phone ?? null,
      await hashPassword(input.password),
      input.role,
      input.university ?? null,
      slug,
      input.locale ?? "en",
      now(),
    )
    .run();
  return (await getUserById(id))!;
}

export async function getUserById(id: string): Promise<User | null> {
  const database = await db();
  return database.prepare(`SELECT ${USER_COLUMNS} FROM users WHERE id = ?`).bind(id).first<User>();
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const database = await db();
  return database
    .prepare(`SELECT ${USER_COLUMNS} FROM users WHERE email = ?`)
    .bind(email.trim().toLowerCase())
    .first<User>();
}

export async function checkCredentials(email: string, password: string): Promise<User | null> {
  const database = await db();
  const row = await database
    .prepare(`SELECT ${USER_COLUMNS}, password_hash FROM users WHERE email = ?`)
    .bind(email.trim().toLowerCase())
    .first<User & { password_hash: string }>();
  if (!row) {
    // Spend comparable time to blunt user-enumeration by timing.
    await hashPassword(password);
    return null;
  }
  if (!row.is_active) return null;
  if (!(await verifyPassword(password, row.password_hash))) return null;
  if (needsRehash(row.password_hash)) {
    await database.prepare("UPDATE users SET password_hash = ? WHERE id = ?").bind(await hashPassword(password), row.id).run();
  }
  const { password_hash: _ignored, ...user } = row;
  void _ignored;
  return user;
}

export async function setPassword(userId: string, password: string): Promise<void> {
  const database = await db();
  await database
    .prepare("UPDATE users SET password_hash = ? WHERE id = ?")
    .bind(await hashPassword(password), userId)
    .run();
  await database.prepare("DELETE FROM sessions WHERE user_id = ?").bind(userId).run();
}

export async function startSession(userId: string): Promise<void> {
  const database = await db();
  const token = randomToken();
  const expires = new Date(Date.now() + SESSION_DAYS * 86400_000);
  const ua = (await headers()).get("user-agent")?.slice(0, 200) ?? null;
  await database
    .prepare("INSERT INTO sessions (token_hash, user_id, expires_at, created_at, user_agent) VALUES (?, ?, ?, ?, ?)")
    .bind(await sha256(token), userId, expires.toISOString(), now(), ua)
    .run();
  await database.prepare("UPDATE users SET last_login_at = ? WHERE id = ?").bind(now(), userId).run();
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function endSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) {
    const database = await db();
    await database.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await sha256(token)).run();
  }
  jar.delete(COOKIE);
}

export async function currentUser(): Promise<User | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const database = await db();
  const row = await database
    .prepare(
      `SELECT ${USER_COLUMNS.split(", ").map((c) => `u.${c}`).join(", ")}, s.expires_at
       FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ?`,
    )
    .bind(await sha256(token))
    .first<User & { expires_at: string }>();
  if (!row || row.expires_at < now() || !row.is_active) return null;
  const { expires_at: _e, ...user } = row;
  void _e;
  return user;
}

/** Use in server components/actions. Redirects to login when not allowed. */
export async function requireUser(roles?: Role[], loginPath = "/en/portal/login"): Promise<User> {
  const user = await currentUser();
  if (!user) redirect(loginPath);
  if (roles && !roles.includes(user.role)) redirect(loginPath + "?denied=1");
  return user;
}

export function isStaff(user: Pick<User, "role"> | null): boolean {
  return !!user && (user.role === "admin" || user.role === "lawyer");
}

// ── One-time tokens (invite / password reset) ─────────────────────────
export async function issueUserToken(userId: string, purpose: "invite" | "reset", hours = 72): Promise<string> {
  const database = await db();
  const token = randomToken();
  await database
    .prepare("INSERT INTO user_tokens (token_hash, user_id, purpose, expires_at) VALUES (?, ?, ?, ?)")
    .bind(await sha256(token), userId, purpose, new Date(Date.now() + hours * 3600_000).toISOString())
    .run();
  return token;
}

export async function consumeUserToken(token: string): Promise<string | null> {
  const database = await db();
  const hash = await sha256(token);
  const row = await database
    .prepare("SELECT user_id, expires_at, used_at FROM user_tokens WHERE token_hash = ?")
    .bind(hash)
    .first<{ user_id: string; expires_at: string; used_at: string | null }>();
  if (!row || row.used_at || row.expires_at < now()) return null;
  await database.prepare("UPDATE user_tokens SET used_at = ? WHERE token_hash = ?").bind(now(), hash).run();
  return row.user_id;
}

export async function peekUserToken(token: string): Promise<boolean> {
  const database = await db();
  const row = await database
    .prepare("SELECT expires_at, used_at FROM user_tokens WHERE token_hash = ?")
    .bind(await sha256(token))
    .first<{ expires_at: string; used_at: string | null }>();
  return !!row && !row.used_at && row.expires_at >= now();
}
