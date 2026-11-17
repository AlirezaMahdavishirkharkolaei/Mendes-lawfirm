import "server-only";
import { db, now } from "@/lib/db";
import { getEnv } from "@/lib/env";

/**
 * File storage for case documents and article PDFs.
 *
 * Uses an R2 bucket when one is bound as FILES (recommended for
 * production — requires enabling R2 on the Cloudflare account), and
 * otherwise stores files in D1, split into 1 MB chunks. The D1 mode needs
 * no payment method, which is why it's the default; moving to R2 later is
 * a matter of adding the binding back in cloudflare.config.ts.
 */

const CHUNK = 1024 * 1024;

/** Upload limit: 20 MB with R2, 10 MB when files live in D1. */
export function maxUploadBytes(): number {
  return r2() ? 20 * 1024 * 1024 : 10 * 1024 * 1024;
}

function r2(): R2Bucket | null {
  const bucket = (getEnv() as unknown as { FILES?: R2Bucket }).FILES;
  return bucket ?? null;
}

export async function putFile(key: string, file: File, contentType: string): Promise<void> {
  const bucket = r2();
  if (bucket) {
    await bucket.put(key, file.stream(), { httpMetadata: { contentType } });
    return;
  }
  const database = await db();
  const bytes = new Uint8Array(await file.arrayBuffer());
  const stamp = now();
  const statements: D1PreparedStatement[] = [database.prepare("DELETE FROM file_blobs WHERE key = ?").bind(key)];
  for (let i = 0, chunk = 0; i < Math.max(bytes.length, 1); i += CHUNK, chunk++) {
    statements.push(
      database
        .prepare("INSERT INTO file_blobs (key, chunk, data, content_type, size_bytes, created_at) VALUES (?, ?, ?, ?, ?, ?)")
        .bind(key, chunk, bytes.slice(i, i + CHUNK).buffer, contentType, bytes.length, stamp),
    );
  }
  await database.batch(statements);
}

export async function getFile(key: string): Promise<{ body: ReadableStream | ArrayBuffer; contentType: string } | null> {
  const bucket = r2();
  if (bucket) {
    const obj = await bucket.get(key);
    return obj ? { body: obj.body, contentType: obj.httpMetadata?.contentType ?? "application/octet-stream" } : null;
  }
  const database = await db();
  const rows = await database
    .prepare("SELECT data, content_type FROM file_blobs WHERE key = ? ORDER BY chunk")
    .bind(key)
    .all<{ data: ArrayBuffer | number[]; content_type: string }>();
  const parts = rows.results ?? [];
  if (!parts.length) return null;
  const buffers = parts.map((p) => (p.data instanceof ArrayBuffer ? new Uint8Array(p.data) : Uint8Array.from(p.data)));
  const total = buffers.reduce((n, b) => n + b.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const b of buffers) {
    out.set(b, offset);
    offset += b.length;
  }
  return { body: out.buffer, contentType: parts[0].content_type };
}
