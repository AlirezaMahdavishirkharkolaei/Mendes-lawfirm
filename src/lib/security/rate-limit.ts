import "server-only";
import { db } from "@/lib/db";

/**
 * Fixed-window rate limiter backed by D1. Good enough for form spam and
 * brute-force protection at this scale; swap for the Workers Rate
 * Limiting binding if traffic grows.
 */
export async function rateLimit(bucket: string, limit: number, windowSeconds: number): Promise<boolean> {
  const database = await db();
  const nowS = Math.floor(Date.now() / 1000);
  const row = await database
    .prepare("SELECT count, reset_at FROM rate_limits WHERE bucket = ?")
    .bind(bucket)
    .first<{ count: number; reset_at: number }>();

  if (!row || row.reset_at <= nowS) {
    await database
      .prepare("INSERT OR REPLACE INTO rate_limits (bucket, count, reset_at) VALUES (?, 1, ?)")
      .bind(bucket, nowS + windowSeconds)
      .run();
    return true;
  }
  if (row.count >= limit) return false;
  await database.prepare("UPDATE rate_limits SET count = count + 1 WHERE bucket = ?").bind(bucket).run();
  return true;
}
