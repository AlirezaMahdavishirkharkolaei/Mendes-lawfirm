import "server-only";
import init from "../../../migrations/0001_init.sql?raw";
import fileBlobs from "../../../migrations/0002_file_blobs.sql?raw";
import realTeam from "../../../migrations/0003_real_team.sql?raw";
import bookingExtras from "../../../migrations/0004_booking_extras.sql?raw";
import { seed } from "./seed";

/**
 * Ordered list of schema migrations. Append new files here — never edit
 * an applied one. The same files live in /migrations so they can also be
 * applied with `cf d1 migrations apply <database-id>`.
 */
const MIGRATIONS: { name: string; sql: string }[] = [
  { name: "0001_init.sql", sql: init },
  { name: "0002_file_blobs.sql", sql: fileBlobs },
  { name: "0003_real_team.sql", sql: realTeam },
  { name: "0004_booking_extras.sql", sql: bookingExtras },
];

function statements(sql: string): string[] {
  return sql
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function migrate(database: D1Database): Promise<void> {
  // One read on the warm path; the table is only created on a brand-new database.
  let applied: { name: string }[];
  try {
    applied = (await database.prepare("SELECT name FROM d1_migrations").all<{ name: string }>()).results ?? [];
  } catch {
    await database
      .prepare(
        "CREATE TABLE IF NOT EXISTS d1_migrations (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, applied_at TEXT DEFAULT CURRENT_TIMESTAMP)",
      )
      .run();
    applied = [];
  }
  const done = new Set(applied.map((r) => r.name));

  let changed = false;
  for (const migration of MIGRATIONS) {
    if (done.has(migration.name)) continue;
    const batch = statements(migration.sql).map((s) => database.prepare(s));
    batch.push(
      database
        .prepare("INSERT INTO d1_migrations (name) VALUES (?)")
        .bind(migration.name),
    );
    await database.batch(batch);
    changed = true;
  }
  if (changed) await seed(database);
}
