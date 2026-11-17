import "server-only";
import { db, now, uuid } from "@/lib/db";

export async function getSettings(): Promise<Record<string, string>> {
  const database = await db();
  // Keys starting with "_" are internal (e.g. the generated signing secret) and never leave the server.
  const rows = await database.prepare("SELECT key, value FROM settings WHERE key NOT LIKE '\\_%' ESCAPE '\\'").all<{ key: string; value: string }>();
  return Object.fromEntries((rows.results ?? []).map((r) => [r.key, r.value]));
}

export async function getSetting(key: string, fallback = ""): Promise<string> {
  const database = await db();
  const row = await database.prepare("SELECT value FROM settings WHERE key = ?").bind(key).first<{ value: string }>();
  return row?.value ?? fallback;
}

export async function setSettings(values: Record<string, string>): Promise<void> {
  const database = await db();
  const stamp = now();
  await database.batch(
    Object.entries(values).map(([key, value]) =>
      database
        .prepare(
          "INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
        )
        .bind(key, value, stamp),
    ),
  );
}

export function emailList(value: string | undefined): string[] {
  return (value ?? "")
    .split(/[,;\s]+/)
    .map((v) => v.trim().toLowerCase())
    .filter((v) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v));
}

export async function audit(
  actor: string | null,
  action: string,
  entity?: string,
  entityId?: string,
  details?: unknown,
): Promise<void> {
  try {
    const database = await db();
    await database
      .prepare("INSERT INTO audit_log (id, actor, action, entity, entity_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .bind(uuid(), actor, action, entity ?? null, entityId ?? null, details ? JSON.stringify(details).slice(0, 4000) : null, now())
      .run();
  } catch (error) {
    console.error("audit failed", error);
  }
}
