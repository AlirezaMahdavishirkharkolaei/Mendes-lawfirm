import "server-only";
import { getEnv } from "@/lib/env";
import { migrate } from "./migrate";

let ready: Promise<void> | null = null;

/**
 * Returns the D1 database, making sure the schema is migrated first.
 * Migration runs once per Worker isolate; subsequent calls are free.
 */
export async function db(): Promise<D1Database> {
  const database = getEnv().DB;
  if (!ready) {
    ready = migrate(database).catch((error) => {
      ready = null;
      throw error;
    });
  }
  await ready;
  return database;
}

export function now(): string {
  return new Date().toISOString();
}

export function uuid(): string {
  return crypto.randomUUID();
}

export function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string" || value === "") return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export async function all<T>(stmt: D1PreparedStatement): Promise<T[]> {
  const result = await stmt.all<T>();
  return result.results ?? [];
}
